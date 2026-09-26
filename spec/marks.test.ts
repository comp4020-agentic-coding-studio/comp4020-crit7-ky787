import { JSDOM } from "jsdom";
import { describe, expect, inject, it } from "vitest";

/**
 * The half of Canvas this prototype keeps: marks and feedback stay visible.
 *
 * The claims under test are that a released mark is on Overview with its
 * score, that its feedback is one link away rather than behind an assignment
 * and a second tab, and that an unreleased mark exists in the database and is
 * reachable from nowhere at all.
 */
const baseUrl = inject("baseUrl");
const COURSE = "seeing-through-obfuscated-code";

const load = async (path: string) => {
  const res = await fetch(new URL(path, baseUrl));
  return { status: res.status, html: await res.text() };
};
const dom = (html: string) => new JSDOM(html).window.document;

describe("recent marks and feedback, on Overview", () => {
  it("shows the score without needing another page", async () => {
    const { html } = await load("/");
    const doc = dom(html);
    const section = doc.querySelector("section[aria-labelledby='recent-marks']");
    expect(section?.textContent).toContain("A1 — Trace the transformation");
    expect(section?.textContent).toContain("15.5 / 20");
    expect(section?.textContent).toContain("78%");
    // and the second course's mark, so aggregation across courses is visible
    expect(section?.textContent).toContain("Portfolio 1 — Expressions and decisions");
    expect(section?.textContent).toContain("17 / 20");
  });

  it("previews the feedback and links straight to all of it", async () => {
    const { html } = await load("/");
    const doc = dom(html);
    const section = doc.querySelector("section[aria-labelledby='recent-marks']");
    expect(section?.textContent).toContain("A solid trace.");
    const links = [...(section?.querySelectorAll<HTMLAnchorElement>("a") ?? [])].map((a) =>
      a.getAttribute("href"),
    );
    expect(links).toContain(`/c/${COURSE}/feedback/a1/`);
  });

  it("shows demonstration times in Australia/Sydney", async () => {
    const { html } = await load("/");
    // A1 is due 2026-08-21T17:00+10:00; in Sydney that is 5:00 pm on 21 Aug.
    expect(html).toContain("Released Fri, 18 Sept 2026, 9:15 am");
    expect(html).toContain("Times shown in Australia/Sydney");
  });
});

describe("due next", () => {
  it("lists upcoming demonstration assessments, soonest first, across both courses", async () => {
    const { html } = await load("/");
    const doc = dom(html);
    const section = doc.querySelector("section[aria-labelledby='due-next']");
    const titles = [...(section?.querySelectorAll(".card .title") ?? [])].map(
      (node) => node.textContent?.trim() ?? "",
    );
    expect(titles[0]).toContain("Portfolio 2");
    expect(titles[1]).toContain("A2 — Recover the semantics");
    expect(titles.join(" ")).toContain("Capstone");
    expect(section?.textContent).toContain("Foundations of Programming");
    expect(section?.textContent).toContain("Seeing Through Obfuscated Code");
  });

  it("links each one to its brief, which is an ordinary outline resource", async () => {
    const { html } = await load("/");
    const doc = dom(html);
    const section = doc.querySelector("section[aria-labelledby='due-next']");
    const links = [...(section?.querySelectorAll<HTMLAnchorElement>(".card .title a") ?? [])].map(
      (a) => a.getAttribute("href"),
    );
    expect(links).toContain(`/c/${COURSE}/a2-recover-the-semantics/`);

    const contents = await load(`/c/${COURSE}/`);
    expect(contents.html).toContain(`/c/${COURSE}/a2-recover-the-semantics/`);
  });
});

describe("released feedback has a page; unreleased feedback has nothing", () => {
  it("serves the whole of a released feedback record", async () => {
    const { status, html } = await load(`/c/${COURSE}/feedback/a1/`);
    expect(status).toBe(200);
    expect(html).toContain("15.5 / 20");
    expect(html).toContain("Tracing across the representations");
    // the whole record, not a preview: this line is near the end of it
    expect(html).toContain("before you write a count, write the convention beside it");
    expect(html).toContain("Demonstration feedback");
  });

  it("404s the unreleased result, even at its own address", async () => {
    const { status } = await load(`/c/${COURSE}/feedback/audit/`);
    expect(status).toBe(404);
  });

  it("keeps the unreleased feedback out of every listing and payload", async () => {
    const marker = "Marked, not yet released";
    for (const path of [
      "/",
      "/saved/",
      `/c/${COURSE}/`,
      `/c/${COURSE}/evidence-audit/`,
      "/search/?q=released",
      "/search/?q=Marked",
      "/search/?q=audit",
    ]) {
      const { html } = await load(path);
      expect(html, `${path} must not carry the unreleased feedback`).not.toContain(marker);
      expect(html, `${path} must not carry the unreleased mark`).not.toContain("7.5 / 10");
    }
  });

  it("the brief for the unreleased assessment is still a normal resource", async () => {
    const { status, html } = await load(`/c/${COURSE}/evidence-audit/`);
    expect(status).toBe(200);
    expect(html).toContain("Week 6 evidence audit");
  });

  it("404s a feedback address that names nothing", async () => {
    expect((await load(`/c/${COURSE}/feedback/nonsense/`)).status).toBe(404);
    expect((await load("/c/no-such-course/feedback/a1/")).status).toBe(404);
  });
});

describe("direct routes and navigation", () => {
  it("404s an unknown course and an unknown resource", async () => {
    expect((await load("/c/no-such-course/")).status).toBe(404);
    expect((await load(`/c/${COURSE}/no-such-resource/`)).status).toBe(404);
  });

  it("gives a resource page its course and section context", async () => {
    const { html } = await load(`/c/${COURSE}/bogus-control-flow-and-opaque-predicates/`);
    const doc = dom(html);
    const crumbs = doc.querySelector(".crumbs")?.textContent ?? "";
    expect(crumbs).toContain("Seeing Through Obfuscated Code");
    expect(crumbs).toContain("Week 6");
    expect(doc.querySelector("[aria-current='page']")).toBeTruthy();
  });

  it("marks the current demonstration week and says it is not the real calendar", async () => {
    const { html } = await load(`/c/${COURSE}/`);
    expect(html).toContain("Demonstration teaching week");
    expect(html).toContain("not the real ANU teaching calendar");
    expect(html).toContain("Go to week");
  });

  it("collapses and expands the whole outline through the URL, with no script", async () => {
    const open = await load(`/c/${COURSE}/`);
    const shut = await load(`/c/${COURSE}/?groups=collapsed`);
    expect(dom(open.html).querySelectorAll("details[open]").length).toBeGreaterThan(5);
    expect(dom(shut.html).querySelectorAll("details[open]").length).toBe(0);
    // collapsed or not, every resource is still listed
    expect(dom(shut.html).querySelectorAll(".contents-list a").length).toBe(
      dom(open.html).querySelectorAll(".contents-list a").length,
    );
  });
});
