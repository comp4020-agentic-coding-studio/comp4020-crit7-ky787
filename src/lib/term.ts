import type { Course } from "./schema";

/**
 * Demonstration teaching calendar.
 *
 * The term dates are fixed values in the seed, never "now minus something":
 * a deadline that quietly moved every time the server restarted would make
 * the Overview page a lie, and would make the spec tests untestable. The only
 * thing derived from the real clock is which fixed week today falls in.
 */

const DAY = 86_400_000;

function mondayOf(course: Pick<Course, "termStart" | "breakAfterWeek" | "breakWeeks">, week: number): number {
  const start = Date.parse(`${course.termStart}T00:00:00+10:00`);
  const pastBreak = course.breakAfterWeek > 0 && week > course.breakAfterWeek ? course.breakWeeks : 0;
  return start + (week - 1 + pastBreak) * 7 * DAY;
}

/** The teaching week today falls in, clamped to the term. */
export function demoWeek(
  course: Pick<Course, "termStart" | "breakAfterWeek" | "breakWeeks" | "teachingWeeks">,
  now: Date = new Date(),
): number {
  const at = now.getTime();
  let current = 1;
  for (let week = 1; week <= course.teachingWeeks; week++) {
    if (mondayOf(course, week) <= at) current = week;
  }
  return current;
}

const SYDNEY = "Australia/Sydney";

const dateTime = new Intl.DateTimeFormat("en-AU", {
  timeZone: SYDNEY,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateOnly = new Intl.DateTimeFormat("en-AU", {
  timeZone: SYDNEY,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Every demonstration time on this site is shown in Australia/Sydney. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateOnly.format(new Date(iso));
}

/** "in 4 days" / "2 weeks ago", for a deadline list that reads at a glance. */
export function relativeDays(iso: string, now: Date = new Date()): string {
  const days = Math.round((Date.parse(iso) - now.getTime()) / DAY);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return days < 14 ? `in ${days} days` : `in ${Math.round(days / 7)} weeks`;
  const ago = -days;
  return ago < 14 ? `${ago} days ago` : `${Math.round(ago / 7)} weeks ago`;
}

export function isUpcoming(iso: string, now: Date = new Date()): boolean {
  return Date.parse(iso) >= now.getTime();
}
