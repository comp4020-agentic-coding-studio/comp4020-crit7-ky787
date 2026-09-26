import type { Course, Item } from "./schema";

/**
 * Every URL in the app, in one place.
 *
 * A resource's URL is its course id plus its own slug, and neither moves when
 * an item is reordered — `position` changes, the address does not. That is
 * what makes a saved resource, a bookmark and a cross-link survive the course
 * being reorganised.
 */
export const overviewPath = "/";
export const savedPath = "/saved/";
export const searchPath = "/search/";

export const coursePath = (course: Pick<Course, "id">) => `/c/${course.id}/`;

export const itemPath = (course: Pick<Course, "id">, item: Pick<Item, "slug">) =>
  `/c/${course.id}/${item.slug}/`;

export const feedbackPath = (course: Pick<Course, "id">, assessmentId: string) =>
  `/c/${course.id}/feedback/${encodeURIComponent(assessmentId.split(":").at(-1) ?? assessmentId)}/`;

/** The anchor for one outline group inside a course contents page. */
export const groupAnchor = (groupId: string) => `#${groupId.split(":").at(-1) ?? groupId}`;
