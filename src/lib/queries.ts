import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "./db";
import { type OutlineGroup, buildOutline, isVisible } from "./outline";
import {
  type Assessment,
  type Course,
  type Item,
  type Result,
  assessments,
  courses,
  items,
  results,
  saves,
  sections,
  visitors,
  visits,
} from "./schema";

/**
 * Every read in the app goes through here, and every one of them that can
 * reach a student is filtered by the same two switches: `isVisible` for
 * content and `results.released` for marks. Outline, search, direct URL and
 * page payload therefore agree by construction — there is no route that sees
 * more than the outline does.
 */

export type Outline = { course: Course; groups: OutlineGroup[]; count: number };

export function listCourses(): Course[] {
  return db.select().from(courses).orderBy(asc(courses.position), asc(courses.id)).all();
}

export function getCourse(id: string): Course | undefined {
  return db.select().from(courses).where(eq(courses.id, id)).get();
}

/** The outline for one course: the single projection every view is built from. */
export function outlineFor(course: Course): Outline {
  const courseSections = db.select().from(sections).where(eq(sections.courseId, course.id)).all();
  const courseItems = db.select().from(items).where(eq(items.courseId, course.id)).all();
  const groups = buildOutline(courseSections, courseItems);
  return { course, groups, count: groups.reduce((n, group) => n + group.items.length, 0) };
}

export function allOutlines(): Outline[] {
  return listCourses().map(outlineFor);
}

/** A resource by its stable URL. Unpublished resolves to nothing, so the
 *  direct route 404s exactly where the outline omits it. */
export function getVisibleItem(courseId: string, slug: string): Item | undefined {
  const item = db
    .select()
    .from(items)
    .where(and(eq(items.courseId, courseId), eq(items.slug, slug)))
    .get();
  return item && isVisible(item) ? item : undefined;
}

export function getItemById(id: string): Item | undefined {
  return db.select().from(items).where(eq(items.id, id)).get();
}

export function getVisibleItemsById(ids: string[]): Map<string, Item> {
  if (ids.length === 0) return new Map();
  const rows = db.select().from(items).where(inArray(items.id, ids)).all().filter(isVisible);
  return new Map(rows.map((item) => [item.id, item]));
}

// --- assessments and released feedback -------------------------------------

export type MarkedAssessment = { assessment: Assessment; result: Result; course: Course };

export function assessmentsFor(courseId: string): Assessment[] {
  return db
    .select()
    .from(assessments)
    .where(eq(assessments.courseId, courseId))
    .orderBy(asc(assessments.dueAt))
    .all();
}

export function getAssessment(courseId: string, id: string): Assessment | undefined {
  return db
    .select()
    .from(assessments)
    .where(and(eq(assessments.courseId, courseId), eq(assessments.id, id)))
    .get();
}

/** Released results only. An unreleased mark has no route and no listing. */
export function getReleasedResult(assessmentId: string): Result | undefined {
  const row = db.select().from(results).where(eq(results.assessmentId, assessmentId)).get();
  return row && row.released === 1 ? row : undefined;
}

export function upcomingAssessments(now: Date, limit = 5): { assessment: Assessment; course: Course }[] {
  const at = now.toISOString();
  return db
    .select({ assessment: assessments, course: courses })
    .from(assessments)
    .innerJoin(courses, eq(courses.id, assessments.courseId))
    .where(sql`${assessments.dueAt} >= ${at}`)
    .orderBy(asc(assessments.dueAt))
    .limit(limit)
    .all();
}

export function recentlyReleased(limit = 5): MarkedAssessment[] {
  return db
    .select({ assessment: assessments, result: results, course: courses })
    .from(results)
    .innerJoin(assessments, eq(assessments.id, results.assessmentId))
    .innerJoin(courses, eq(courses.id, assessments.courseId))
    .where(eq(results.released, 1))
    .orderBy(desc(results.releasedAt))
    .limit(limit)
    .all();
}

// --- search ----------------------------------------------------------------

export type SearchHit = {
  item: Item;
  course: Course;
  group: OutlineGroup;
  field: "title" | "summary" | "body";
  snippet: string;
};

/** LIKE wildcards in the visitor's own words must not become wildcards. */
function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * Search is a filter over the outline, not a second index.
 *
 * SQLite does the matching (parameterised LIKE, escaped), and the result is
 * then intersected with the outline each course already publishes. That
 * intersection is the guarantee: a hit can only be something the student can
 * already find by browsing, and it always arrives with the section it lives
 * in, so search supplements the outline rather than compensating for it.
 */
export function search(query: string, courseId?: string): SearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const pattern = likePattern(trimmed);
  const match = or(
    sql`${items.title} LIKE ${pattern} ESCAPE '\\'`,
    sql`${items.summary} LIKE ${pattern} ESCAPE '\\'`,
    sql`${items.body} LIKE ${pattern} ESCAPE '\\'`,
  );

  const rows = db
    .select()
    .from(items)
    .where(courseId ? and(eq(items.courseId, courseId), match) : match)
    .all();

  const wanted = new Set(rows.map((row) => row.id));
  const hits: SearchHit[] = [];
  for (const outline of allOutlines()) {
    if (courseId && outline.course.id !== courseId) continue;
    for (const group of outline.groups) {
      for (const item of group.items) {
        if (!wanted.has(item.id)) continue;
        hits.push({ item, course: outline.course, group, ...excerpt(item, trimmed) });
      }
    }
  }
  return hits;
}

function excerpt(item: Item, query: string): { field: SearchHit["field"]; snippet: string } {
  const needle = query.toLowerCase();
  if (item.title.toLowerCase().includes(needle)) return { field: "title", snippet: item.summary };
  if (item.summary.toLowerCase().includes(needle)) return { field: "summary", snippet: item.summary };

  const body = item.body.replace(/\s+/g, " ");
  const at = body.toLowerCase().indexOf(needle);
  if (at === -1) return { field: "body", snippet: item.summary };
  const from = Math.max(0, at - 90);
  const to = Math.min(body.length, at + needle.length + 110);
  return {
    field: "body",
    snippet: `${from > 0 ? "…" : ""}${body.slice(from, to).trim()}${to < body.length ? "…" : ""}`,
  };
}

// --- visitor state ---------------------------------------------------------

export type SavedResource = { item: Item; course: Course; note: string; updatedAt: string };

/** Written the first time a visitor saves or opens something, never on a bare
 *  page view, so a reader who saves nothing leaves no row behind. */
function ensureVisitor(visitorId: string): void {
  const now = new Date().toISOString();
  db.insert(visitors)
    .values({ id: visitorId, createdAt: now, lastSeenAt: now })
    .onConflictDoUpdate({ target: visitors.id, set: { lastSeenAt: now } })
    .run();
}

export function listSaves(visitorId: string): SavedResource[] {
  return db
    .select({ item: items, course: courses, note: saves.note, updatedAt: saves.updatedAt })
    .from(saves)
    .innerJoin(items, eq(items.id, saves.itemId))
    .innerJoin(courses, eq(courses.id, items.courseId))
    .where(eq(saves.visitorId, visitorId))
    .orderBy(desc(saves.updatedAt))
    .all()
    .filter((row) => isVisible(row.item));
}

export function countSaves(visitorId: string): number {
  return listSaves(visitorId).length;
}

export function getSave(visitorId: string, itemId: string): { note: string } | undefined {
  return db
    .select({ note: saves.note })
    .from(saves)
    .where(and(eq(saves.visitorId, visitorId), eq(saves.itemId, itemId)))
    .get();
}

/** Idempotent: the identity of a save is (visitor, item), so saving twice is
 *  one row and never clears a note the visitor already wrote. */
export function addSave(visitorId: string, itemId: string): void {
  ensureVisitor(visitorId);
  const now = new Date().toISOString();
  db.insert(saves)
    .values({ visitorId, itemId, note: "", createdAt: now, updatedAt: now })
    .onConflictDoNothing()
    .run();
}

export function removeSave(visitorId: string, itemId: string): void {
  db.delete(saves).where(and(eq(saves.visitorId, visitorId), eq(saves.itemId, itemId))).run();
}

/** Returns false when this visitor has not saved the item — which is also
 *  what happens if a request names someone else's save. */
export function setNote(visitorId: string, itemId: string, note: string): boolean {
  const now = new Date().toISOString();
  const changed = db
    .update(saves)
    .set({ note, updatedAt: now })
    .where(and(eq(saves.visitorId, visitorId), eq(saves.itemId, itemId)))
    .run();
  return changed.changes > 0;
}

export function recordVisit(visitorId: string, itemId: string): void {
  ensureVisitor(visitorId);
  const now = new Date().toISOString();
  db.insert(visits)
    .values({ visitorId, itemId, visitedAt: now })
    .onConflictDoUpdate({
      target: [visits.visitorId, visits.itemId],
      set: { visitedAt: now },
    })
    .run();
}

export function recentVisits(visitorId: string, limit = 5): { item: Item; course: Course }[] {
  return db
    .select({ item: items, course: courses, visitedAt: visits.visitedAt })
    .from(visits)
    .innerJoin(items, eq(items.id, visits.itemId))
    .innerJoin(courses, eq(courses.id, items.courseId))
    .where(eq(visits.visitorId, visitorId))
    .orderBy(desc(visits.visitedAt))
    .limit(limit * 2)
    .all()
    .filter((row) => isVisible(row.item))
    .slice(0, limit);
}
