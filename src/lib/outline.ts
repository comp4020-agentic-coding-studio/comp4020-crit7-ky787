import type { Item, Section } from "./schema";

/**
 * The complete-outline rule, as one pure function over rows.
 *
 * Everything that navigates this app — the left navigation, the full contents
 * page, the resource count, the previous/next links and the search filter —
 * calls this. There is no second, hand-written catalogue to fall out of step
 * with the database, which is the whole point of the redesign: the outline is
 * a projection of the content records, not a parallel list of them.
 *
 * Two rules do the work:
 *
 *   1. An item is in the outline if and only if it is visible. `isVisible` is
 *      the single definition, and the direct route and search import the same
 *      one, so a resource cannot be reachable by URL while missing from the
 *      outline.
 *
 *   2. An item with no section — or with a section that no longer exists, say
 *      because the section moved — lands in "Other course resources"
 *      automatically. Filing is not something an author can forget to do.
 */

export const FALLBACK_GROUP_ID = "other";
export const FALLBACK_GROUP_TITLE = "Other course resources";

export type OutlineGroup = {
  /** Stable anchor id, used for in-page links and the expansion state key. */
  id: string;
  kind: "info" | "assessment" | "week" | "other";
  title: string;
  week: number | null;
  items: Item[];
};

/** The one definition of "the demo student can see this". */
export function isVisible(item: Pick<Item, "published">): boolean {
  return item.published === 1;
}

// What a student wants near the top of a course: what the course is, then
// what they are being marked on, then the teaching weeks in order. The
// derived fallback group always comes after all three.
const SECTION_KIND_RANK = { info: 0, assessment: 1, week: 2 } as const;

function bySectionOrder(a: Section, b: Section): number {
  return (
    SECTION_KIND_RANK[a.kind] - SECTION_KIND_RANK[b.kind] ||
    a.position - b.position ||
    (a.week ?? 0) - (b.week ?? 0) ||
    a.id.localeCompare(b.id)
  );
}

/**
 * Deterministic item order: the author's position first, then title, then id.
 * The tie-breakers matter — two items given the same position must still come
 * out in the same order on every request, or "appears exactly once, here" is
 * not a stable claim.
 */
function byItemOrder(a: Item, b: Item): number {
  return a.position - b.position || a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
}

export function buildOutline(sections: Section[], allItems: Item[]): OutlineGroup[] {
  const visible = allItems.filter(isVisible);
  const known = new Set(sections.map((section) => section.id));

  const grouped = new Map<string, Item[]>();
  const unfiled: Item[] = [];
  for (const item of visible) {
    // Null section, or a section that is not in this course's list any more:
    // both mean the same thing to a student, so both go to the fallback.
    if (item.sectionId && known.has(item.sectionId)) {
      const bucket = grouped.get(item.sectionId);
      if (bucket) bucket.push(item);
      else grouped.set(item.sectionId, [item]);
    } else {
      unfiled.push(item);
    }
  }

  const groups: OutlineGroup[] = [];
  for (const section of [...sections].sort(bySectionOrder)) {
    const sectionItems = (grouped.get(section.id) ?? []).sort(byItemOrder);
    // A part of the course with nothing visible in it is not somewhere a
    // student can navigate to, so it is not in the outline.
    if (sectionItems.length === 0) continue;
    groups.push({
      id: section.id,
      kind: section.kind,
      title: section.title,
      week: section.week,
      items: sectionItems,
    });
  }

  if (unfiled.length > 0) {
    groups.push({
      id: FALLBACK_GROUP_ID,
      kind: "other",
      title: FALLBACK_GROUP_TITLE,
      week: null,
      items: unfiled.sort(byItemOrder),
    });
  }

  return groups;
}

/** Every visible item, in outline order — the flat reading of the same tree. */
export function outlineItems(groups: OutlineGroup[]): Item[] {
  return groups.flatMap((group) => group.items);
}

export function outlineCount(groups: OutlineGroup[]): number {
  return groups.reduce((total, group) => total + group.items.length, 0);
}

/** The group an item sits in, for the "you are here" line on a resource page. */
export function groupOf(groups: OutlineGroup[], itemId: string): OutlineGroup | undefined {
  return groups.find((group) => group.items.some((item) => item.id === itemId));
}

/** Previous and next in outline order, so reading straight through works. */
export function neighbours(
  groups: OutlineGroup[],
  itemId: string,
): { previous: Item | undefined; next: Item | undefined } {
  const flat = outlineItems(groups);
  const at = flat.findIndex((item) => item.id === itemId);
  if (at === -1) return { previous: undefined, next: undefined };
  return { previous: flat[at - 1], next: flat[at + 1] };
}
