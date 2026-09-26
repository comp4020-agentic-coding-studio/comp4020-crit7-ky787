import { describe, expect, inject, it } from "vitest";
import { Visitor, scratchDatabase, startServer } from "./session";

/**
 * Saving, noting and unsaving, driven over HTTP the way a browser drives it.
 *
 * The flow in the brief, end to end: open a resource and save it, add a note,
 * find both through Saved, reload, edit, reload, remove, reload. Then the two
 * things that make it real persistence rather than a convincing screen — a
 * second visitor cannot see or touch any of it, and it is still there after
 * the server has actually been restarted.
 */
const baseUrl = inject("baseUrl");

const COURSE = "seeing-through-obfuscated-code";
const SLUG = "obfuscation-terminology";
const ITEM = `${COURSE}:${SLUG}`;
const RESOURCE = `/c/${COURSE}/${SLUG}/`;

const location = (res: Response) => res.headers.get("location") ?? "";

describe("save, note, revisit", () => {
  it("runs the whole flow and keeps it across reloads", async () => {
    const visitor = new Visitor(baseUrl);

    // 1. open the resource and save it
    const page = await visitor.text(RESOURCE);
    expect(page).toContain("Save for revision");
    const saved = await visitor.post("/api/saves", {
      action: "save",
      item: ITEM,
      return: RESOURCE,
    });
    expect(saved.status).toBe(303);
    expect(location(saved)).toBe(`${RESOURCE}?status=saved`);

    // 2. add a note
    const note = `revisit the UNSAT caveat ${process.hrtime.bigint()}`;
    const written = await visitor.post("/api/saves", {
      action: "note",
      item: ITEM,
      note,
      return: "/saved/",
    });
    expect(location(written)).toBe("/saved/?status=note-saved");

    // 3. find the resource and the note through Saved
    let savedPage = await visitor.text("/saved/");
    expect(savedPage).toContain("Obfuscation terminology");
    expect(savedPage).toContain(note);

    // 4. reload: still there
    savedPage = await visitor.text("/saved/");
    expect(savedPage).toContain(note);
    expect(await visitor.text(RESOURCE)).toContain(note);

    // 5. edit the note, reload, verify the edit
    const edited = `${note} — and the path prefix it holds under`;
    await visitor.post("/api/saves", { action: "note", item: ITEM, note: edited, return: "/saved/" });
    savedPage = await visitor.text("/saved/");
    expect(savedPage).toContain(edited);

    // 6. remove the save; it stays removed after another reload
    const removed = await visitor.post("/api/saves", {
      action: "remove",
      item: ITEM,
      return: "/saved/",
    });
    expect(location(removed)).toBe("/saved/?status=removed");
    savedPage = await visitor.text("/saved/");
    expect(savedPage).not.toContain(edited);
    expect(savedPage).toContain("Nothing saved yet");
    expect(await visitor.text("/saved/")).toContain("Nothing saved yet");
  });

  it("clears a note without removing the save", async () => {
    const visitor = new Visitor(baseUrl);
    await visitor.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });
    await visitor.post("/api/saves", { action: "note", item: ITEM, note: "temporary", return: "/saved/" });
    const cleared = await visitor.post("/api/saves", {
      action: "note",
      item: ITEM,
      note: "   ",
      return: "/saved/",
    });
    expect(location(cleared)).toBe("/saved/?status=note-cleared");
    const page = await visitor.text("/saved/");
    expect(page).toContain("Obfuscation terminology");
    expect(page).not.toContain("temporary");
  });

  it("saving twice is one save, and does not wipe the note", async () => {
    const visitor = new Visitor(baseUrl);
    await visitor.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });
    await visitor.post("/api/saves", { action: "note", item: ITEM, note: "keep me", return: "/saved/" });
    await visitor.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });
    const page = await visitor.text("/saved/");
    expect(page).toContain("keep me");
    expect(page.split("Obfuscation terminology").length - 1).toBeGreaterThan(0);
    const headings = [...page.matchAll(/<h2><a href="\/c\/[^"]*obfuscation-terminology\//g)];
    expect(headings).toHaveLength(1);
  });
});

describe("one visitor's notes are their own", () => {
  it("a separate session sees nothing and cannot change anything", async () => {
    const mine = new Visitor(baseUrl);
    const theirs = new Visitor(baseUrl);

    const secret = `private note ${process.hrtime.bigint()}`;
    await mine.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });
    await mine.post("/api/saves", { action: "note", item: ITEM, note: secret, return: "/saved/" });

    // the other visitor's Saved page is empty
    const theirSaved = await theirs.text("/saved/");
    expect(theirSaved).not.toContain(secret);
    expect(theirSaved).toContain("Nothing saved yet");
    expect(theirs.cookieValue).not.toBe(mine.cookieValue);

    // and writing to the same item touches only their own row
    await theirs.post("/api/saves", {
      action: "note",
      item: ITEM,
      note: "OVERWRITTEN",
      return: "/saved/",
    });
    expect(await mine.text("/saved/")).toContain(secret);
    expect(await mine.text("/saved/")).not.toContain("OVERWRITTEN");

    // removing it on their side leaves mine alone
    await theirs.post("/api/saves", { action: "remove", item: ITEM, return: "/saved/" });
    expect(await mine.text("/saved/")).toContain(secret);
  });

  it("hands out an httpOnly session cookie the client never names", async () => {
    const res = await fetch(baseUrl);
    const cookie = (res.headers.getSetCookie?.() ?? []).find((c) => c.startsWith("sto_visitor="));
    expect(cookie).toBeTruthy();
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    const value = cookie?.split(";")[0]?.split("=")[1] ?? "";
    expect(value).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });
});

describe("writes are validated, and a refusal says so", () => {
  it("refuses an unknown item", async () => {
    const visitor = new Visitor(baseUrl);
    const res = await visitor.post("/api/saves", {
      action: "save",
      item: "not-a-course:not-a-thing",
      return: "/saved/",
    });
    expect(location(res)).toBe("/saved/?status=error-unknown-item");
    expect(await visitor.text("/saved/")).toContain("Nothing saved yet");
  });

  it("refuses an unpublished item, exactly as the outline omits it", async () => {
    const visitor = new Visitor(baseUrl);
    const res = await visitor.post("/api/saves", {
      action: "save",
      item: `${COURSE}:draft-revision-guide`,
      return: "/saved/",
    });
    expect(location(res)).toBe("/saved/?status=error-unknown-item");
  });

  it("refuses an over-long note and writes nothing", async () => {
    const visitor = new Visitor(baseUrl);
    await visitor.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });
    await visitor.post("/api/saves", { action: "note", item: ITEM, note: "short", return: "/saved/" });
    const res = await visitor.post("/api/saves", {
      action: "note",
      item: ITEM,
      note: "x".repeat(2001),
      return: "/saved/",
    });
    expect(location(res)).toBe("/saved/?status=error-note-too-long");
    const page = await visitor.text("/saved/");
    expect(page).toContain("short");
    expect(page).not.toContain("x".repeat(200));
  });

  it("refuses an unknown action", async () => {
    const visitor = new Visitor(baseUrl);
    const res = await visitor.post("/api/saves", { action: "drop-table", item: ITEM, return: "/saved/" });
    expect(location(res)).toBe("/saved/?status=error-bad-request");
  });

  it("will not be turned into an open redirect", async () => {
    const visitor = new Visitor(baseUrl);
    const res = await visitor.post("/api/saves", {
      action: "save",
      item: ITEM,
      return: "https://example.com/phish",
    });
    expect(location(res)).toBe("/saved/?status=saved");
  });

  it("refuses a cross-site form post outright", async () => {
    const res = await fetch(new URL("/api/saves", baseUrl), {
      method: "POST",
      headers: { origin: "https://cross-site.example.com" },
      body: new URLSearchParams({ action: "save", item: ITEM }),
      redirect: "manual",
    });
    expect(res.status).toBe(403);
  });

  it("renders a note as text, not as markup", async () => {
    const visitor = new Visitor(baseUrl);
    await visitor.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });
    await visitor.post("/api/saves", {
      action: "note",
      item: ITEM,
      note: '<img src=x onerror="alert(1)"> **not bold**',
      return: "/saved/",
    });
    const page = await visitor.text("/saved/");
    expect(page).not.toContain('<img src=x onerror=');
    expect(page).toContain("&lt;img src=x onerror=");
    expect(page).toContain("**not bold**");
  });
});

describe("state lives in the database, not in the process", () => {
  it("survives an actual restart of the server", async () => {
    const databasePath = scratchDatabase();
    const note = `after the restart ${process.hrtime.bigint()}`;

    const first = await startServer(databasePath);
    const visitor = new Visitor(first.baseUrl);
    await visitor.get("/");
    await visitor.post("/api/saves", { action: "save", item: ITEM, return: "/saved/" });
    await visitor.post("/api/saves", { action: "note", item: ITEM, note, return: "/saved/" });
    expect(await visitor.text("/saved/")).toContain(note);
    await first.stop();

    // Same database file, new process — which also re-runs the migrations and
    // the seed, so this is the reseeding case as well.
    const second = await startServer(databasePath);
    const returning = new Visitor(second.baseUrl);
    // the same browser, so the same cookie
    const sameCookie = visitor.cookieValue ?? "";
    const res = await fetch(new URL("/saved/", second.baseUrl), {
      headers: { cookie: sameCookie },
    });
    const page = await res.text();
    expect(page).toContain(note);
    expect(page).toContain("Obfuscation terminology");
    await returning.get("/");
    await second.stop();
  }, 60_000);
});
