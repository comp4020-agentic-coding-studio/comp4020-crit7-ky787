import { parseFrontmatter } from "@astrojs/markdown-remark";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { assessments as assessmentRows, courses as courseRows, items as itemRows, results as resultRows, saves, sections as sectionRows, visits } from "./schema";
import { assessments as seedAssessments, courses as seedCourses } from "./seed-data";

/**
 * Idempotent seeding of the demonstration course material.
 *
 * Runs on every boot, after the migrations. Everything here is an upsert keyed
 * by primary key, so a restart, a redeploy or a re-run changes nothing that has
 * not actually changed in the seed. It writes only fixture tables: `saves` and
 * `visits` are read here exactly once, to decide whether a withdrawn resource
 * can be pruned, and are never written or deleted.
 */

type Db = BetterSQLite3Database<Record<string, never>>;

type ItemKind = "page" | "lecture" | "practical" | "assessment" | "reference" | "external";

const ITEM_KINDS: ItemKind[] = ["page", "lecture", "practical", "assessment", "reference", "external"];

type ParsedItem = {
  courseId: string;
  slug: string;
  sectionKey: string | null;
  kind: ItemKind;
  title: string;
  summary: string;
  body: string;
  externalUrl: string | null;
  position: number;
  published: number;
  source: string;
};

// Every resource in the app, loaded from disk at build time. One file is one
// content record; there is no second list of them anywhere.
const files = import.meta.glob("../content/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function fail(path: string, message: string): never {
  throw new Error(`${path}: ${message}`);
}

function parseItem(path: string, raw: string): ParsedItem {
  // ../content/<course-id>/<slug>.md
  const parts = path.split("/");
  const slug = parts.at(-1)?.replace(/\.md$/, "");
  const courseId = parts.at(-2);
  if (!slug || !courseId) fail(path, "expected src/content/<course>/<slug>.md");

  const { frontmatter, content } = parseFrontmatter(raw);
  const data = frontmatter as Record<string, unknown>;

  const text = (key: string, required = true): string => {
    const value = data[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
    if (required) fail(path, `frontmatter needs a non-empty "${key}"`);
    return "";
  };

  const kind = text("kind");
  if (!ITEM_KINDS.includes(kind as ItemKind)) {
    fail(path, `kind "${kind}" is not one of ${ITEM_KINDS.join(", ")}`);
  }

  const position = data.position;
  if (typeof position !== "number" || !Number.isFinite(position)) {
    fail(path, 'frontmatter needs a numeric "position"');
  }

  const published = data.published === undefined ? true : data.published;
  if (typeof published !== "boolean") fail(path, '"published" must be true or false');

  const section = data.section;
  if (section !== undefined && typeof section !== "string") {
    fail(path, '"section" must be a section key, or be left out entirely');
  }

  const externalUrl = text("externalUrl", false) || null;
  if (kind === "external" && !externalUrl) fail(path, 'an external resource needs "externalUrl"');

  return {
    courseId,
    slug,
    sectionKey: (section as string | undefined) ?? null,
    kind: kind as ItemKind,
    title: text("title"),
    summary: text("summary"),
    body: content.trim(),
    externalUrl,
    position,
    published: published ? 1 : 0,
    source: text("source"),
  };
}

const itemId = (courseId: string, slug: string) => `${courseId}:${slug}`;
const sectionId = (courseId: string, key: string) => `${courseId}:${key}`;

export function seed(db: Db): void {
  const parsed = Object.entries(files).map(([path, raw]) => parseItem(path, raw));
  const knownCourses = new Set(seedCourses.map((course) => course.id));

  for (const item of parsed) {
    if (!knownCourses.has(item.courseId)) {
      fail(`src/content/${item.courseId}/${item.slug}.md`, "no course with that id in seed-data.ts");
    }
  }

  db.transaction((tx) => {
    for (const course of seedCourses) {
      const row = {
        id: course.id,
        code: course.code,
        title: course.title,
        subtitle: course.subtitle,
        termLabel: course.termLabel,
        termStart: course.termStart,
        teachingWeeks: course.teachingWeeks,
        breakAfterWeek: course.breakAfterWeek,
        breakWeeks: course.breakWeeks,
        position: course.position,
      };
      tx.insert(courseRows).values(row).onConflictDoUpdate({ target: courseRows.id, set: row }).run();

      course.sections.forEach((section, index) => {
        const sectionRow = {
          id: sectionId(course.id, section.key),
          courseId: course.id,
          kind: (section.week === undefined ? "info" : "week") as "info" | "week",
          title: section.title,
          week: section.week ?? null,
          position: index,
        };
        tx
          .insert(sectionRows)
          .values(sectionRow)
          .onConflictDoUpdate({ target: sectionRows.id, set: sectionRow })
          .run();
      });
    }

    const knownSections = new Set(
      seedCourses.flatMap((course) => course.sections.map((s) => sectionId(course.id, s.key))),
    );

    for (const item of parsed) {
      const resolved = item.sectionKey ? sectionId(item.courseId, item.sectionKey) : null;
      if (resolved && !knownSections.has(resolved)) {
        fail(
          `src/content/${item.courseId}/${item.slug}.md`,
          `section "${item.sectionKey}" is not a section of ${item.courseId}`,
        );
      }
      const row = {
        id: itemId(item.courseId, item.slug),
        courseId: item.courseId,
        sectionId: resolved,
        slug: item.slug,
        kind: item.kind,
        title: item.title,
        summary: item.summary,
        body: item.body,
        externalUrl: item.externalUrl,
        position: item.position,
        published: item.published,
        source: item.source,
      };
      tx.insert(itemRows).values(row).onConflictDoUpdate({ target: itemRows.id, set: row }).run();
    }

    // A resource withdrawn from the seed should stop appearing — but not at the
    // cost of somebody's saved note. Prune only what nothing personal points at;
    // anything else stays exactly as it is, and the foreign keys would refuse
    // the delete in any case.
    const seededIds = parsed.map((item) => itemId(item.courseId, item.slug));
    const stale = tx
      .select({ id: itemRows.id })
      .from(itemRows)
      .where(
        and(
          inArray(itemRows.courseId, [...knownCourses]),
          seededIds.length > 0 ? notInArray(itemRows.id, seededIds) : undefined,
        ),
      )
      .all()
      .map((row) => row.id);

    for (const id of stale) {
      const held =
        tx.select({ id: saves.itemId }).from(saves).where(eq(saves.itemId, id)).get() ??
        tx.select({ id: visits.itemId }).from(visits).where(eq(visits.itemId, id)).get();
      if (held) continue;
      tx.delete(resultRows).where(
        inArray(
          resultRows.assessmentId,
          tx.select({ id: assessmentRows.id }).from(assessmentRows).where(eq(assessmentRows.itemId, id)),
        ),
      ).run();
      tx.delete(assessmentRows).where(eq(assessmentRows.itemId, id)).run();
      tx.delete(itemRows).where(eq(itemRows.id, id)).run();
    }

    for (const assessment of seedAssessments) {
      const brief = itemId(assessment.courseId, assessment.itemSlug);
      const row = {
        id: assessment.id,
        courseId: assessment.courseId,
        itemId: brief,
        label: assessment.label,
        title: assessment.title,
        dueAt: assessment.dueAt,
        weight: assessment.weight,
        maxScore: assessment.maxScore,
        position: assessment.position,
      };
      tx
        .insert(assessmentRows)
        .values(row)
        .onConflictDoUpdate({ target: assessmentRows.id, set: row })
        .run();

      if (!assessment.result) {
        tx.delete(resultRows).where(eq(resultRows.assessmentId, assessment.id)).run();
        continue;
      }
      const result = {
        assessmentId: assessment.id,
        score: assessment.result.score,
        feedback: assessment.result.feedback,
        markerNote: assessment.result.markerNote,
        released: assessment.result.released ? 1 : 0,
        releasedAt: assessment.result.releasedAt ?? null,
      };
      tx
        .insert(resultRows)
        .values(result)
        .onConflictDoUpdate({ target: resultRows.assessmentId, set: result })
        .run();
    }
  });
}
