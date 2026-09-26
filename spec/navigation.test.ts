import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, inject, it } from "vitest";
import { courseIds, hidden, visibleIn } from "./content";

/**
 * The promise this prototype is built on: one dependable outline.
 *
 * "Every content item the demo student can see appears exactly once in its
 * course's primary outline" is checked here by comparing identifiers, not
 * counts — two lists of the same length can still be different lists.
 */
const baseUrl = inject("baseUrl");

const load = async (path: string): Promise<Document> => {
  const res = await fetch(new URL(path, baseUrl));
  expect(res.status, `${path} should serve`).toBe(200);
  return new JSDOM(await res.text(), { url: new URL(path, baseUrl).href }).window.document;
};

const hrefs = (doc: Document, selector: string, courseId: string): string[] =>
  [...doc.querySelectorAll<HTMLAnchorElement>(selector)]
    .map((a) => a.getAttribute("href") ?? "")
    .filter((href) => href.startsWith(`/c/${courseId}/`))
    .map((href) => href.replace(`/c/${courseId}/`, "").replace(/\/$/, ""))
    .filter((slug) => slug !== "" && !slug.startsWith("feedback/") && !slug.includes("?"));

for (const courseId of courseIds()) {
  describe(`complete outline: ${courseId}`, () => {
    let contents: Document;
    let expected: string[];

    beforeAll(async () => {
      contents = await load(`/c/${courseId}/`);
      expected = visibleIn(courseId)
        .map((record) => record.slug)
        .sort();
    });

    it("the contents page lists exactly the visible content records", () => {
      const listed = hrefs(contents, ".contents-list a", courseId);
      expect([...listed].sort()).toEqual(expected);
    });

    it("lists each of them exactly once", () => {
      const listed = hrefs(contents, ".contents-list a", courseId);
      const seen = new Map<string, number>();
      for (const slug of listed) seen.set(slug, (seen.get(slug) ?? 0) + 1);
      expect([...seen].filter(([, n]) => n > 1)).toEqual([]);
      expect(listed).toHaveLength(expected.length);
    });

    it("the navigation lists the same set, from the same projection", () => {
      const inNav = hrefs(contents, ".nav .group-items a", courseId);
      expect([...inNav].sort()).toEqual(expected);
    });

    it("states the resource count, and it matches", () => {
      const count = contents.querySelector(".toolbar .count")?.textContent ?? "";
      expect(count).toContain(`${expected.length} resources`);
    });

    it("files every sectionless resource under Other course resources", () => {
      const unfiled = visibleIn(courseId)
        .filter((record) => record.section === null)
        .map((record) => record.slug)
        .sort();
      expect(unfiled.length, "this course needs an unfiled resource to be a real test").toBeGreaterThan(0);

      const group = [...contents.querySelectorAll(".contents-group")].find((node) =>
        node.querySelector("h2")?.textContent?.includes("Other course resources"),
      );
      expect(group, "the fallback group must be rendered").toBeTruthy();
      const listed = [...(group?.querySelectorAll<HTMLAnchorElement>(".contents-list a") ?? [])]
        .map((a) => (a.getAttribute("href") ?? "").replace(`/c/${courseId}/`, "").replace(/\/$/, ""))
        .sort();
      expect(listed).toEqual(unfiled);
    });

    it("orders the groups: information, assessment, weeks, then the fallback", () => {
      const titles = [...contents.querySelectorAll(".contents-group h2")].map(
        (node) => node.textContent?.replace(/\s+/g, " ").trim() ?? "",
      );
      expect(titles[0]).toContain("Course information");
      expect(titles[1]).toContain("Assessments");
      expect(titles.at(-1)).toContain("Other course resources");

      const weeks = titles
        .filter((title) => /^Week \d+/.test(title))
        .map((title) => Number(title.match(/^Week (\d+)/)?.[1]));
      expect(weeks).toEqual([...weeks].sort((a, b) => (a ?? 0) - (b ?? 0)));
      expect(weeks.length).toBeGreaterThan(0);
    });

    it("gathers every assessment brief under Assessments, in due order", () => {
      const group = [...contents.querySelectorAll(".contents-group")].find((node) =>
        node.querySelector("h2")?.textContent?.trim().startsWith("Assessments"),
      );
      expect(group, "each course needs an Assessments group").toBeTruthy();

      const listed = [...(group?.querySelectorAll<HTMLAnchorElement>(".contents-list a") ?? [])].map(
        (a) => (a.getAttribute("href") ?? "").replace(`/c/${courseId}/`, "").replace(/\/$/, ""),
      );
      const briefs = visibleIn(courseId).filter((record) => record.kind === "assessment");
      expect(briefs.length).toBeGreaterThan(1);
      for (const brief of briefs) expect(listed).toContain(brief.slug);

      // and none is left behind in a teaching week, which is the failure this
      // grouping exists to prevent: an assessment you can only find by
      // remembering which week it was set in.
      expect(
        visibleIn(courseId).filter((r) => r.kind === "assessment" && r.section !== "assessment"),
      ).toEqual([]);

      // and the group reads in the order the records give it — for these
      // courses, the order the assessment falls due
      const byDue = [...briefs].sort((a, b) => a.position - b.position).map((b) => b.slug);
      expect(listed.filter((slug) => byDue.includes(slug))).toEqual(byDue);
    });
  });
}

describe("the unassigned reference is reachable two ways", () => {
  const course = "seeing-through-obfuscated-code";
  const terminology = `/c/${course}/obfuscation-terminology/`;

  it("has no week, and is listed in Other course resources", () => {
    const record = visibleIn(course).find((r) => r.slug === "obfuscation-terminology");
    expect(record?.section, "the demo depends on this item having no section").toBeNull();
  });

  it("loads directly, without going through any other page", async () => {
    const doc = await load(terminology);
    expect(doc.querySelector("h1")?.textContent).toContain("Obfuscation terminology");
  });

  it("is cross-linked from Bogus control flow, to the same canonical URL", async () => {
    const doc = await load(`/c/${course}/bogus-control-flow-and-opaque-predicates/`);
    const links = [...doc.querySelectorAll<HTMLAnchorElement>(".article a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(links).toContain(terminology);
  });

  it("is findable by search, with the section it lives in", async () => {
    const doc = await load("/search/?q=opaque+predicate");
    const hit = [...doc.querySelectorAll(".card")].find((card) =>
      card.querySelector(".title a")?.getAttribute("href") === terminology,
    );
    expect(hit, "search must find it").toBeTruthy();
    expect(hit?.querySelector(".meta")?.textContent).toContain("Other course resources");
  });
});

describe("search never reaches past the outline", () => {
  it("every hit is a resource the contents page already lists", async () => {
    const doc = await load("/search/?q=the");
    const hits = [...doc.querySelectorAll<HTMLAnchorElement>(".card .title a")].map(
      (a) => a.getAttribute("href") ?? "",
    );
    expect(hits.length).toBeGreaterThan(5);

    const listed = new Set<string>();
    for (const courseId of courseIds()) {
      const contents = await load(`/c/${courseId}/`);
      for (const a of contents.querySelectorAll<HTMLAnchorElement>(".contents-list a")) {
        listed.add(a.getAttribute("href") ?? "");
      }
    }
    expect(hits.filter((href) => !listed.has(href))).toEqual([]);
  });

  it("says so plainly when there is nothing, rather than nothing at all", async () => {
    const doc = await load("/search/?q=zzzznotathing");
    expect(doc.querySelector(".empty")?.textContent).toContain("No resource matches");
  });
});

describe("publication state is applied everywhere, not just to the list", () => {
  it("the fixtures include an unpublished resource, or this proves nothing", () => {
    expect(hidden().length).toBeGreaterThan(0);
  });

  for (const record of hidden()) {
    const path = `/c/${record.courseId}/${record.slug}/`;

    it(`${record.slug}: its own URL is a 404`, async () => {
      const res = await fetch(new URL(path, baseUrl));
      expect(res.status).toBe(404);
    });

    it(`${record.slug}: absent from the contents page and the navigation`, async () => {
      const html = await (await fetch(new URL(`/c/${record.courseId}/`, baseUrl))).text();
      expect(html).not.toContain(path);
      expect(html).not.toContain(record.title);
    });

    it(`${record.slug}: absent from search, title and body alike`, async () => {
      const byTitle = await (
        await fetch(new URL(`/search/?q=${encodeURIComponent(record.title)}`, baseUrl))
      ).text();
      expect(byTitle).not.toContain(path);
      const byBody = await (
        await fetch(new URL("/search/?q=deliberately+unpublished", baseUrl))
      ).text();
      expect(byBody).not.toContain(path);
    });
  }
});

describe("the right-hand rail carries deadlines and marks, never navigation", () => {
  const course = "seeing-through-obfuscated-code";

  it("is on a course page, and is a complementary landmark of its own", async () => {
    const doc = await load(`/c/${course}/`);
    const rail = doc.querySelector("aside.utility");
    expect(rail).toBeTruthy();
    expect(rail?.getAttribute("aria-label")).toBeTruthy();
    // It must not sit inside main or nav, or it stops being a landmark at all.
    expect(rail?.closest("main")).toBeNull();
    expect(rail?.closest("nav")).toBeNull();
  });

  it("shows this course's upcoming work and released marks", async () => {
    const doc = await load(`/c/${course}/`);
    const rail = doc.querySelector("aside.utility");
    expect(rail?.textContent).toContain("A2 — Recover the semantics");
    expect(rail?.textContent).toContain("A1 — Trace the transformation");
    expect(rail?.textContent).toContain("15.5 / 20");
    // scoped to the course you are reading: the other course's work is not here
    expect(rail?.textContent).not.toContain("Portfolio");
  });

  it("never leaks an unreleased mark into the rail", async () => {
    for (const path of [`/c/${course}/`, `/c/${course}/evidence-audit/`]) {
      const doc = await load(path);
      const rail = doc.querySelector("aside.utility");
      expect(rail?.textContent).not.toContain("7.5 / 10");
      expect(rail?.textContent).not.toContain("Marked, not yet released");
    }
  });

  it("contains no course-outline links, so it cannot compete with the navigation", async () => {
    const doc = await load(`/c/${course}/`);
    const rail = doc.querySelector("aside.utility");
    const railLinks = [...(rail?.querySelectorAll<HTMLAnchorElement>("a") ?? [])].map(
      (a) => a.getAttribute("href") ?? "",
    );
    const outlineLinks = new Set(
      [...doc.querySelectorAll<HTMLAnchorElement>(".contents-list a")].map(
        (a) => a.getAttribute("href") ?? "",
      ),
    );
    // The only resource links it may carry are the briefs its deadlines name.
    const briefs = railLinks.filter((href) => outlineLinks.has(href));
    expect(briefs.length).toBeLessThanOrEqual(4);
    for (const href of briefs) {
      const title =
        [...doc.querySelectorAll<HTMLAnchorElement>(".contents-list a")]
          .find((a) => a.getAttribute("href") === href)
          ?.closest(".contents-group")
          ?.querySelector("h2")?.textContent ?? "";
      expect(title).toContain("Assessments");
    }
  });

  it("is absent from Overview, where the same two things are the page", async () => {
    for (const path of ["/", "/saved/", "/search/"]) {
      const doc = await load(path);
      expect(doc.querySelector("aside.utility"), `${path} should have no rail`).toBeNull();
    }
  });
});
