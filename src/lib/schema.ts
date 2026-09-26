import { sql } from "drizzle-orm";
import { index, int, primaryKey, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts), locally and deployed. Never edit the database
// by hand: state on the deployed volume outlives every deploy, and the
// migration trail is what keeps old state and new code compatible.
//
// Two kinds of row live in here and they are governed differently:
//
//   Course material (courses, sections, items, assessments, results) is a
//   shared read-only demo fixture. src/lib/seed.ts upserts it by primary key
//   at boot, so reseeding is idempotent and never deletes.
//
//   Visitor state (visitors, saves, visits) belongs to one anonymous demo
//   session, is written only from a server-resolved session id, and is never
//   touched by seeding, migration or deployment.

/** A course the demo student is enrolled in. `id` is the slug used in URLs. */
export const courses = sqliteTable("courses", {
  id: text().primaryKey(),
  code: text().notNull(),
  title: text().notNull(),
  subtitle: text().notNull(),
  /** Demonstration teaching period, e.g. "Semester 2, 2026". */
  termLabel: text("term_label").notNull(),
  /** Monday of teaching week 1, as a plain ISO date. Fixed, never recomputed. */
  termStart: text("term_start").notNull(),
  teachingWeeks: int("teaching_weeks").notNull(),
  /** Teaching break sits after this week number; 0 for no break. */
  breakAfterWeek: int("break_after_week").notNull().default(0),
  breakWeeks: int("break_weeks").notNull().default(0),
  position: int().notNull().default(0),
});

/**
 * One ordered part of a course outline. `kind` fixes where the part sits:
 * course information first, then the teaching weeks. There is deliberately no
 * row for "Other course resources" — that group is derived from items with no
 * section, so a resource cannot be left out of the outline by forgetting to
 * file it (see src/lib/outline.ts).
 */
export const sections = sqliteTable(
  "sections",
  {
    id: text().primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id),
    kind: text({ enum: ["info", "week"] }).notNull(),
    title: text().notNull(),
    week: int(),
    position: int().notNull().default(0),
  },
  (table) => [index("sections_course_idx").on(table.courseId)],
);

/**
 * A content item: everything the student can open. One row per item, one
 * primary section per item, and `slug` is stable — reordering moves
 * `position`, never the URL.
 */
export const items = sqliteTable(
  "items",
  {
    id: text().primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id),
    /** Null means the item has no section, so the outline files it under
     *  "Other course resources" automatically. */
    sectionId: text("section_id").references(() => sections.id),
    slug: text().notNull(),
    kind: text({
      enum: ["page", "lecture", "practical", "assessment", "reference", "external"],
    }).notNull(),
    title: text().notNull(),
    summary: text().notNull(),
    /** Markdown, rendered server-side. Empty for an external-resource link. */
    body: text().notNull().default(""),
    externalUrl: text("external_url"),
    position: int().notNull().default(0),
    /** The single visibility switch: unpublished items are absent from the
     *  outline, from search and from their own URL. */
    published: int().notNull().default(1),
    /** Where this demo content came from — reused, or newly written. */
    source: text().notNull().default(""),
  },
  (table) => [
    unique("items_course_slug").on(table.courseId, table.slug),
    index("items_course_idx").on(table.courseId),
    index("items_section_idx").on(table.sectionId),
  ],
);

/** A demonstration assessment. Its brief is an ordinary item in the outline. */
export const assessments = sqliteTable(
  "assessments",
  {
    id: text().primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id),
    label: text().notNull(),
    title: text().notNull(),
    /** Fixed ISO timestamp with an explicit offset; displayed Australia/Sydney. */
    dueAt: text("due_at").notNull(),
    weight: int().notNull(),
    maxScore: real("max_score").notNull(),
    position: int().notNull().default(0),
  },
  (table) => [index("assessments_course_idx").on(table.courseId)],
);

/**
 * The demo student's result for one assessment. `released` is the second
 * visibility switch: an unreleased result never reaches Overview, search or
 * the feedback URL.
 */
export const results = sqliteTable("results", {
  assessmentId: text("assessment_id")
    .primaryKey()
    .references(() => assessments.id),
  score: real().notNull(),
  /** Markdown, rendered server-side. Demonstration feedback, not a real mark. */
  feedback: text().notNull(),
  markerNote: text("marker_note").notNull().default(""),
  released: int().notNull().default(0),
  releasedAt: text("released_at"),
});

/**
 * An anonymous demo visitor. The id is generated on the server and handed out
 * in an httpOnly cookie; nothing a client submits is ever trusted as identity.
 */
export const visitors = sqliteTable("visitors", {
  id: text().primaryKey(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  lastSeenAt: text("last_seen_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * One visitor's saved resource, with an optional revision note. The composite
 * primary key is the identity of a save — one visitor cannot save the same
 * item twice, and no visitor can see another's row.
 */
export const saves = sqliteTable(
  "saves",
  {
    visitorId: text("visitor_id")
      .notNull()
      .references(() => visitors.id),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id),
    note: text().notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [primaryKey({ columns: [table.visitorId, table.itemId] })],
);

/** Last time a visitor opened an item — the source for "Continue studying". */
export const visits = sqliteTable(
  "visits",
  {
    visitorId: text("visitor_id")
      .notNull()
      .references(() => visitors.id),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id),
    visitedAt: text("visited_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [primaryKey({ columns: [table.visitorId, table.itemId] })],
);

export type Course = typeof courses.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Result = typeof results.$inferSelect;
export type Save = typeof saves.$inferSelect;

