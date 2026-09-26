---
title: "A2 — Recover the semantics"
summary: Given a flattened or gated function, a recovered graph and a set of solver results, decide what has been established — and defend the boundary you draw.
kind: assessment
section: w09
position: 30
source: Reused — brief, rubric and spec lines from comp4020-ass2-Ky787 (src/content/assessments/a2-recover-the-semantics.mdx)
---

**Weight 30%. Due Friday of week 9, 5:00pm.** Demonstration assessment — the
date and the mark on this site are fictional.

You are given a function, a recovered graph, and a set of solver results. You
are also given a claim that somebody else has made about them. Your job is to
adjudicate it.

## Requirements

- A single PDF, every claim citing a retained file.
- Each branch discussed has its **two obligations** written out, with the path
  prefix named.
- Each solver status is reported as SAT, UNSAT or UNKNOWN, and UNKNOWN is never
  treated as equivalence.
- The state and memory assumptions the analysis depends on are listed
  explicitly.
- Block and edge counts name their recovery convention and are not compared
  across conventions.
- The submission reaches a verdict on the supplied claim and says what evidence
  would change it.

## Marking

| Criterion | Weight |
| --- | --- |
| Proof obligations, stated correctly and in scope | 30 |
| Reasoning from the graph and the solver record | 25 |
| Assumptions, state and coverage boundaries | 25 |
| Judgement on the claim you are asked to adjudicate | 20 |

## A note on the verdict criterion

Twenty marks are for reaching a verdict. A submission that lists every
consideration and declines to decide does not score well here. The point of the
course is not that nothing can be concluded; it is that conclusions carry their
scope with them.
