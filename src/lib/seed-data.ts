/**
 * The demonstration course record.
 *
 * Every date, mark and piece of feedback below is fictional and fixed. They
 * are literals, never "now minus three weeks": a deadline that moved each time
 * the server restarted would make Overview untrustworthy and the spec tests
 * unwritable. The teaching term is Semester 2, 2026, chosen so that the demo
 * has both marked work behind it and deadlines ahead of it.
 *
 * Resources live one-per-file under src/content/<course>/, with their metadata
 * in each file's frontmatter. This file carries only what a markdown file
 * cannot: the courses, their ordered sections, and the assessment record.
 */

export type SeedCourse = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  termLabel: string;
  termStart: string;
  teachingWeeks: number;
  breakAfterWeek: number;
  breakWeeks: number;
  position: number;
  /** Section key -> title. "info" is the course-information group; "wNN" a week.
   *  There is no key for "Other course resources": that group is derived. */
  sections: { key: string; title: string; week?: number }[];
};

export type SeedAssessment = {
  id: string;
  courseId: string;
  /** Slug of the brief, which is an ordinary item in the course outline. */
  itemSlug: string;
  label: string;
  title: string;
  dueAt: string;
  weight: number;
  maxScore: number;
  position: number;
  result?: {
    score: number;
    released: boolean;
    releasedAt?: string;
    feedback: string;
    markerNote: string;
  };
};

const STO = "seeing-through-obfuscated-code";
const FOP = "foundations-of-programming";

const weekSections = (weeks: number[]) =>
  weeks.map((week) => ({
    key: `w${String(week).padStart(2, "0")}`,
    title: `Week ${week}`,
    week,
  }));

export const courses: SeedCourse[] = [
  {
    id: STO,
    code: "SLOP8445",
    title: "Seeing Through Obfuscated Code",
    subtitle: "Obfuscation, assembly, and recovering program semantics",
    termLabel: "Semester 2, 2026",
    termStart: "2026-07-20",
    teachingWeeks: 12,
    breakAfterWeek: 6,
    breakWeeks: 2,
    position: 1,
    sections: [
      { key: "info", title: "Course information" },
      ...weekSections([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    ],
  },
  {
    id: FOP,
    code: "SLOP1001",
    title: "Foundations of Programming",
    subtitle: "A first course in programming, taught in Python",
    termLabel: "Semester 2, 2026",
    termStart: "2026-07-20",
    teachingWeeks: 12,
    breakAfterWeek: 6,
    breakWeeks: 2,
    position: 2,
    sections: [
      { key: "info", title: "Course information" },
      ...weekSections([5, 7, 8, 9, 12]),
    ],
  },
];

export const assessments: SeedAssessment[] = [
  {
    id: `${STO}:a1`,
    courseId: STO,
    itemSlug: "a1-trace-the-transformation",
    label: "A1",
    title: "Trace the transformation",
    dueAt: "2026-08-21T17:00:00+10:00",
    weight: 20,
    maxScore: 20,
    position: 1,
    result: {
      score: 15.5,
      released: true,
      releasedAt: "2026-09-18T09:15:00+10:00",
      markerNote: "Demonstration feedback. Fictional mark on fictional work.",
      feedback: `## Overall

A solid trace. You located the ADD site in all three representations and your
line and address references are correct, which is more than half the marks and
the half most people lose.

**15.5 / 20.**

## Tracing across the representations — 27/35

The source-to-IR step is exact. The IR-to-disassembly step is where you lost
marks: you say the pass "removed" the original operation, but the retained IR
still contains it as dead code and it is *instruction selection* that drops it.
Those are different agents at different stages, and the distinction is the
week 3 finding.

## Comparator and convention — 22/25

You named the comparator and the optimisation level. You did not say which
counting convention your instruction counts use, so the 115 and 311 figures are
unanchored. One sentence would have fixed this.

## What the evidence does not establish — 19/25

Your limitations section is real, not padding, and I was glad to read it. But it
stops one step short. You write that the identity holds "for any k" — check it
modulo 2³² and say so, because that is precisely the check the A1 spec asks for
and precisely the gap week 6 ends on.

## Citation and legibility — 13/15

Clear, well-organised, every claim cited. Two figures have no caption.

## For A2

Carry over one habit: before you write a count, write the convention beside it.
You will need it — A2 compares graphs recovered under two different conventions
and the marks are in keeping them apart.`,
    },
  },
  {
    id: `${STO}:audit`,
    courseId: STO,
    itemSlug: "evidence-audit",
    label: "Audit",
    title: "Week 6 evidence audit",
    dueAt: "2026-08-28T17:00:00+10:00",
    weight: 10,
    maxScore: 10,
    position: 2,
    result: {
      score: 7.5,
      released: false,
      markerNote:
        "Demonstration feedback held back on purpose: this result is marked but unreleased, so the prototype can be checked for leaks.",
      feedback: `Marked, not yet released.

This feedback exists in the database and must not appear anywhere a student can
reach: not on Overview, not in search, not at the feedback URL. It is the
negative case the release check is tested against.`,
    },
  },
  {
    id: `${STO}:a2`,
    courseId: STO,
    itemSlug: "a2-recover-the-semantics",
    label: "A2",
    title: "Recover the semantics",
    dueAt: "2026-10-02T17:00:00+10:00",
    weight: 30,
    maxScore: 30,
    position: 3,
  },
  {
    id: `${STO}:capstone`,
    courseId: STO,
    itemSlug: "capstone-unfamiliar-binary",
    label: "Capstone",
    title: "Seeing through an unfamiliar binary",
    dueAt: "2026-10-30T17:00:00+11:00",
    weight: 40,
    maxScore: 40,
    position: 4,
  },
  {
    id: `${FOP}:p1`,
    courseId: FOP,
    itemSlug: "portfolio-1",
    label: "Portfolio 1",
    title: "Expressions and decisions",
    dueAt: "2026-08-14T17:00:00+10:00",
    weight: 20,
    maxScore: 20,
    position: 1,
    result: {
      score: 17,
      released: true,
      releasedAt: "2026-09-04T16:40:00+10:00",
      markerNote: "Demonstration feedback. Fictional mark on fictional work.",
      feedback: `## Overall

Four working programs and four honest accounts of how they got there. This is
what the portfolio is for.

**17 / 20.**

## What worked

Entry 2 is the best thing here. You expected the loop to sum the list, it
returned the last element, and you correctly identified that the accumulator was
being reset inside the loop rather than before it. You then said the thing that
earns the mark: *the program ran and the answer was wrong, which is worse than
crashing.*

## What to work on

Entry 4 has no account at all — the program worked first time and you wrote two
lines saying so. If nothing broke, say what you checked to be confident it was
right. "It printed the expected output for the supplied input, and for an empty
list it printed 0" is a real answer.

Entry 3 uses \`range(len(items))\` and then only ever uses \`items[i]\`. It is
correct and it is harder to read than looping over the items. Worth changing
before Portfolio 2, where one entry has to be a refactor.

## For Portfolio 2

Pick entry 3 as your refactor. You already know what you would change, which
means the hard part is done and you can spend the effort on the comparator
output instead.`,
    },
  },
  {
    id: `${FOP}:p2`,
    courseId: FOP,
    itemSlug: "portfolio-2",
    label: "Portfolio 2",
    title: "Structure and data",
    dueAt: "2026-09-30T17:00:00+10:00",
    weight: 30,
    maxScore: 30,
    position: 2,
  },
  {
    id: `${FOP}:final`,
    courseId: FOP,
    itemSlug: "final-project",
    label: "Final project",
    title: "A small working program",
    dueAt: "2026-11-06T17:00:00+11:00",
    weight: 50,
    maxScore: 50,
    position: 3,
  },
];
