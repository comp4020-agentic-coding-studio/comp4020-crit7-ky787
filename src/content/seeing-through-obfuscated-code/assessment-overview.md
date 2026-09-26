---
title: Assessment overview
summary: Four pieces of assessment, what each one asks for, and the one criterion they share.
kind: page
section: info
position: 20
source: Reused — weights, criteria and submission rules from comp4020-ass2-Ky787 (src/content/assessments/*.mdx)
---

All demonstration marks and dates on this site are fictional.

| Piece | Weight | Due |
| --- | --- | --- |
| A1 — Trace the transformation | 20% | Week 5 |
| Week 6 evidence audit | 10% | Week 6 |
| A2 — Recover the semantics | 30% | Week 9 |
| Capstone — Seeing through an unfamiliar binary | 40% | Week 12 |

## The criterion they share

Every rubric in this course reserves a quarter of its marks for **what the
evidence does not establish**. This is not a modesty exercise. The two most
instructive results in the course's corpus are a rewrite that produces a
smaller graph and the wrong answer, and a lift that passes the LLVM verifier
and miscomputes 3,917 of 4,118 inputs. Both would have been reported as
successes by anyone willing to describe their evidence loosely.

## The scope checklist

Every submission is marked against the same six-line checklist:

- name the specimen and the optimisation level;
- identify the representation and the metric convention;
- link the retained evidence;
- state the relevant input and state assumptions;
- distinguish SAT, UNSAT and UNKNOWN;
- say whether an executable was actually produced, and whether it was validated.

A submission that reports a count without saying which representation it
counted, or quotes an UNSAT without naming the path prefix it holds under, has
not met the checklist however good the rest of it is.
