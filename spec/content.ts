import { parseFrontmatter } from "@astrojs/markdown-remark";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * The content records, read straight off disk.
 *
 * The spec needs a source of truth for "everything the demo student can see"
 * that does not come from the thing under test. These files are it: one
 * markdown file per resource, which the seed loads into SQLite and the app
 * then projects into an outline. If the app's outline and this listing ever
 * disagree, something is reachable that is not listed, or listed and not
 * reachable — and that is the failure the whole prototype exists to prevent.
 */

export type ContentRecord = {
  courseId: string;
  slug: string;
  title: string;
  kind: string;
  section: string | null;
  published: boolean;
};

const ROOT = "src/content";

export function contentRecords(): ContentRecord[] {
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((course) =>
      readdirSync(join(ROOT, course.name))
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
          const { frontmatter } = parseFrontmatter(readFileSync(join(ROOT, course.name, file), "utf8"));
          const data = frontmatter as Record<string, unknown>;
          return {
            courseId: course.name,
            slug: file.replace(/\.md$/, ""),
            title: String(data.title ?? ""),
            kind: String(data.kind ?? ""),
            section: typeof data.section === "string" ? data.section : null,
            published: data.published !== false,
          };
        }),
    );
}

export const courseIds = (): string[] => [...new Set(contentRecords().map((r) => r.courseId))].sort();

export const visibleIn = (courseId: string): ContentRecord[] =>
  contentRecords().filter((r) => r.courseId === courseId && r.published);

export const hidden = (): ContentRecord[] => contentRecords().filter((r) => !r.published);
