import { describe, expect, it } from "vitest";
import {
  FALLBACK_GROUP_TITLE,
  buildOutline,
  neighbours,
  outlineCount,
  outlineItems,
} from "../src/lib/outline";
import type { Item, Section } from "../src/lib/schema";

/**
 * The complete-outline rule, tested where it lives.
 *
 * These are unit tests on the pure function every view calls, so they can
 * exercise the cases the seeded content cannot reach on demand — a section
 * that has been moved away, two items given the same position, a reordering.
 * spec/navigation.test.ts then checks the running app agrees with it.
 */

const section = (id: string, over: Partial<Section> = {}): Section => ({
  id,
  courseId: "c",
  kind: "week",
  title: id,
  week: null,
  position: 0,
  ...over,
});

const item = (id: string, over: Partial<Item> = {}): Item => ({
  id,
  courseId: "c",
  sectionId: null,
  slug: id,
  kind: "page",
  title: id,
  summary: "",
  body: "",
  externalUrl: null,
  position: 0,
  published: 1,
  source: "",
  ...over,
});

const ids = (groups: ReturnType<typeof buildOutline>) => outlineItems(groups).map((i) => i.id);

describe("buildOutline", () => {
  const sections = [
    section("info", { kind: "info", title: "Course information", position: 0 }),
    section("w01", { title: "Week 1", week: 1, position: 1 }),
    section("w02", { title: "Week 2", week: 2, position: 2 }),
  ];

  it("lists every visible item exactly once", () => {
    const items = [
      item("a", { sectionId: "info" }),
      item("b", { sectionId: "w01" }),
      item("c", { sectionId: "w02" }),
      item("d"), // no section
    ];
    const groups = buildOutline(sections, items);
    const listed = ids(groups);
    expect([...listed].sort()).toEqual(["a", "b", "c", "d"]);
    expect(new Set(listed).size).toBe(listed.length);
    expect(outlineCount(groups)).toBe(4);
  });

  it("files an item with no section under Other course resources, last", () => {
    const groups = buildOutline(sections, [item("a", { sectionId: "w01" }), item("loose")]);
    const last = groups.at(-1);
    expect(last?.title).toBe(FALLBACK_GROUP_TITLE);
    expect(last?.items.map((i) => i.id)).toEqual(["loose"]);
  });

  it("does not orphan an item whose section has been moved away", () => {
    // The section this item points at is no longer part of the course.
    const groups = buildOutline(
      [section("w01", { title: "Week 1", week: 1 })],
      [item("a", { sectionId: "w01" }), item("stranded", { sectionId: "w99" })],
    );
    expect(ids(groups)).toContain("stranded");
    expect(groups.at(-1)?.title).toBe(FALLBACK_GROUP_TITLE);
  });

  it("excludes unpublished items from the outline and the count", () => {
    const groups = buildOutline(sections, [
      item("shown", { sectionId: "w01" }),
      item("hidden", { sectionId: "w01", published: 0 }),
      item("hidden-unfiled", { published: 0 }),
    ]);
    expect(ids(groups)).toEqual(["shown"]);
    expect(outlineCount(groups)).toBe(1);
    // and no empty fallback group is invented for the unpublished unfiled item
    expect(groups.map((g) => g.title)).not.toContain(FALLBACK_GROUP_TITLE);
  });

  it("orders the fixed groups: information, assessment, then the weeks", () => {
    const withAssessment = [
      section("w02", { title: "Week 2", week: 2, position: 9 }),
      section("assessment", { kind: "assessment", title: "Assessments", position: 0 }),
      section("info", { kind: "info", title: "Course information", position: 0 }),
      section("w01", { title: "Week 1", week: 1, position: 1 }),
    ];
    const groups = buildOutline(withAssessment, [
      item("a", { sectionId: "w01" }),
      item("b", { sectionId: "info" }),
      item("c", { sectionId: "assessment" }),
      item("d", { sectionId: "w02" }),
      item("loose"),
    ]);
    // Section kind decides the group order, not the position each was given.
    expect(groups.map((g) => g.title)).toEqual([
      "Course information",
      "Assessments",
      "Week 1",
      "Week 2",
      FALLBACK_GROUP_TITLE,
    ]);
  });

  it("drops sections with nothing visible in them", () => {
    const groups = buildOutline(sections, [item("a", { sectionId: "w02" })]);
    expect(groups.map((g) => g.id)).toEqual(["w02"]);
  });

  it("orders by position, then title, then id — deterministically", () => {
    const items = [
      item("z", { sectionId: "w01", position: 2, title: "Zed" }),
      item("m", { sectionId: "w01", position: 1, title: "Mid" }),
      item("b2", { sectionId: "w01", position: 1, title: "Aaa" }),
      item("b1", { sectionId: "w01", position: 1, title: "Aaa" }),
    ];
    const first = ids(buildOutline(sections, items));
    const shuffled = ids(buildOutline(sections, [...items].reverse()));
    expect(first).toEqual(["b1", "b2", "m", "z"]);
    expect(shuffled).toEqual(first);
  });

  it("reordering changes the order and nothing else", () => {
    const before = [
      item("a", { sectionId: "w01", position: 1, slug: "alpha" }),
      item("b", { sectionId: "w01", position: 2, slug: "beta" }),
      item("c", { sectionId: "w02", position: 1, slug: "gamma" }),
    ];
    // Same rows, new positions, and one item moved to a different section.
    const after = [
      item("a", { sectionId: "w01", position: 9, slug: "alpha" }),
      item("b", { sectionId: "w02", position: 1, slug: "beta" }),
      item("c", { sectionId: "w02", position: 0, slug: "gamma" }),
    ];

    const outlineBefore = buildOutline(sections, before);
    const outlineAfter = buildOutline(sections, after);

    expect(ids(outlineBefore)).toEqual(["a", "b", "c"]);
    expect(ids(outlineAfter)).toEqual(["a", "c", "b"]);
    // Membership is unchanged, and so is every item's URL: `slug` is what the
    // address is built from, and reordering never touches it.
    expect([...ids(outlineAfter)].sort()).toEqual([...ids(outlineBefore)].sort());
    const slugs = (o: ReturnType<typeof buildOutline>) =>
      Object.fromEntries(outlineItems(o).map((i) => [i.id, i.slug]));
    expect(slugs(outlineAfter)).toEqual(slugs(outlineBefore));
  });

  it("reads straight through the outline with previous and next", () => {
    const groups = buildOutline(sections, [
      item("a", { sectionId: "info" }),
      item("b", { sectionId: "w01" }),
      item("c"),
    ]);
    expect(neighbours(groups, "b")).toEqual({
      previous: expect.objectContaining({ id: "a" }),
      next: expect.objectContaining({ id: "c" }),
    });
    expect(neighbours(groups, "a").previous).toBeUndefined();
    expect(neighbours(groups, "c").next).toBeUndefined();
    expect(neighbours(groups, "missing")).toEqual({ previous: undefined, next: undefined });
  });
});
