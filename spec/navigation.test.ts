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

    it("puts the fallback group last, after the weeks", () => {
      const titles = [...contents.querySelectorAll(".contents-group h2")].map(
        (node) => node.textContent?.trim().split("\n")[0] ?? "",
      );
      expect(titles.at(-1)).toContain("Other course resources");
      expect(titles[0]).toContain("Course information");
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
