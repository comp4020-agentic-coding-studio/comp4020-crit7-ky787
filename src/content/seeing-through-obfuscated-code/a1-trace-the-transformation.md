---
title: "A1 — Trace the transformation"
summary: Follow one operation from C to IR to x64 across a clean/obfuscated pair you have not seen, and write down what you established and what you did not.
kind: assessment
section: assessment
position: 10
source: Reused — brief, rubric and spec lines from comp4020-ass2-Ky787 (src/content/assessments/a1-trace-the-transformation.mdx)
---

**Weight 20%. Due Friday of week 5, 5:00pm.** Demonstration assessment — the
date and the mark on this site are fictional.

You are given a clean/obfuscated pair you have not seen. Follow one named
operation through the three representations and report what you established.

## What to submit

A single PDF. Every claim cites a file and a line or an address.

## Requirements

- One named operation is located in the source, the post-pass IR and the
  disassembly, with line numbers or addresses given for each.
- The comparator is a clean build of the same compiler family at the same
  optimisation level, and the submission says so.
- Every count states its representation and its counting convention.
- The arithmetic identity claimed is checked **modulo 2³²**, not over the
  integers.
- The submission contains a section listing what it does not establish, and that
  section is not padding.

## Marking

| Criterion | Weight |
| --- | --- |
| Accurate tracing across the three representations | 35 |
| Correct comparator, convention and optimisation level | 25 |
| What the evidence does not establish | 25 |
| Citation and legibility | 15 |

## The common failure

Every year, several submissions report a count without its representation —
"the function grew from 115 to 311" with no statement of whether those are IR or
native instructions, or at what level. That is not a small omission. The two
numbers in this course's own corpus that look most like a clean result, 115 and
311, are native counts at `-O0`, and at `-O1` the same pair does not exist.
