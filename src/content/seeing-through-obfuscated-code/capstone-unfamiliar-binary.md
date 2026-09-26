---
title: "Capstone — Seeing through an unfamiliar binary"
summary: One sample, withheld identity, every method you have. Choose an approach, justify it, validate whatever you conclude, and state the boundary of your own result.
kind: assessment
section: w12
position: 20
source: Reused — brief, rubric and spec lines from comp4020-ass2-Ky787 (src/content/assessments/capstone-unfamiliar-binary.mdx)
---

**Weight 40%. Due Friday of week 12, 5:00pm.** Demonstration assessment — the
date and the mark on this site are fictional.

You are given one sample. You are not told which implementation produced it or
which transformations were applied.

## Requirements

- Submitted as a report plus the working files needed to follow it.
- Every artefact discussed is identified by filename and SHA-256.
- At least two representations are used, and the report says why those two.
- Each method used is justified against a stated assumption it depends on.
- Every conclusion names the level it was validated at — **expression**,
  **graph**, **lifted function**, or **executable**.
- The report distinguishes analysis success, semantic proof, a produced binary,
  and runtime correctness, and does not conflate them.
- A limitations section states what was not established and what evidence would
  settle it.
- **No claim of a working rewritten binary is made without a runtime record.**

## Marking

| Criterion | Weight |
| --- | --- |
| Method selection, and the reasons given for it | 25 |
| Analysis across more than one representation | 25 |
| Validation — what was checked, how, and at what level | 25 |
| Limitations and what remains unknown | 15 |
| Provenance and communication | 10 |

## What a good capstone looks like

It is not the one that recovered the most. It is the one whose claims you could
check. A capstone that establishes one thing at the executable level and is
precise about the four it could not establish scores above one that asserts five
results at the graph level and validates none of them.
