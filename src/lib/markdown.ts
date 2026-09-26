import { createMarkdownProcessor } from "@astrojs/markdown-remark";

/**
 * Course material is markdown in the database, rendered on the server.
 *
 * This is for *authored* content only — seeded resource bodies and released
 * assessment feedback, both of which are fixtures in this repo. Anything a
 * visitor types (a revision note) is never passed through here: notes are
 * rendered as text by the template, so markup in a note is displayed, not
 * executed.
 */
const processor = await createMarkdownProcessor({
  shikiConfig: { theme: "github-light", wrap: false },
});

// Rendering the same body on every request is wasted work: the content is a
// fixture and changes only when the server restarts with a new seed.
const cache = new Map<string, string>();

export async function renderMarkdown(key: string, source: string): Promise<string> {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const { code } = await processor.render(source);
  cache.set(key, code);
  return code;
}

/** Headings in an article, for the on-page contents list on a long resource. */
export type Heading = { depth: number; slug: string; text: string };

export async function headingsOf(source: string): Promise<Heading[]> {
  const { metadata } = await processor.render(source);
  return metadata.headings
    .filter((heading) => heading.depth === 2)
    .map(({ depth, slug, text }) => ({ depth, slug, text }));
}
