---
title: Course outline and how this course runs
summary: What the twelve weeks do, the one program they all work on, and the reading habit the whole course is built around.
kind: page
section: info
position: 10
source: Reused — course question, structure and framing from comp4020-ass2-Ky787 (src/course-config.ts, src/pages/index.astro)
---

This course asks one question for twelve weeks:

> How much program meaning survives a change of representation, and which
> deobfuscation methods generalise beyond one implementation?

Everything here happens to **one 483-line C file**, frozen before anything was
built from it. Because the source was fixed first, no difference between two of
this course's binaries can be a difference in the program. When the machine code
changes, something changed it — and that is the only explanation available.

## The shape of the twelve weeks

| Block | Weeks | What it establishes |
| --- | --- | --- |
| 1 | 1–3 | One program has several truthful descriptions, and they disagree about size. |
| 2 | 4–6 | Something always simplifies obfuscated arithmetic for you — and it is usually not your analysis. |
| 3 | 7–9 | What a proof is worth, and what still has to happen after one. |
| 4 | 10–12 | Two results in this corpus look like successes and are not. |

Each block opens with a spine lecture and carries three studio weeks.

## The habit

Every week page ends with a ledger in two columns: what the week established,
and what it withheld. The second column is the one that carries the marks. By
week 12 you should be unable to read a claim about a binary without asking
which representation it is about, which comparator it was measured against, and
at which optimisation level.

Three sentences you will write all semester:

1. *Which representation am I looking at?*
2. *What would have to be true for my answer to be wrong?*
3. *This does not show that…*

## Where things live

The teaching weeks are listed in order in this course's contents. Reference
material that does not belong to any one week — the terminology, the claim
boundaries, the tool catalogue — sits under **Other course resources**, and is
findable there without having to remember which page linked to it.
