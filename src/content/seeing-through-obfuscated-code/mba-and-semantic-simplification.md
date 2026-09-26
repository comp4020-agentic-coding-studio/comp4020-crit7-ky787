---
title: MBA and semantic simplification
summary: Mixed Boolean-arithmetic, the tools that reduce it, and the difference between a shorter expression and a proved one.
kind: page
section: w04
position: 20
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-04.mdx)
---

> **This week's question.** A simplifier returned a shorter expression. What
> exactly has been proved, and by what?

Last week's substitution was an identity with a cancelling constant. This week
the same source line becomes a nine-term expression mixing multiplication, XOR
and complement — and it is still an identity, still with a cancelling structure,
just one you have to do some work to see.

## The specimen

| Field | Value |
| --- | --- |
| Pass | linear MBA, seeded |
| Target | `demo_substitution`, all 24 sites transformed |
| Reproducibility | the seed is **not** sufficient: two fresh same-command runs gave different IR hashes. The retained artefact *is* the specimen |
| Native size | 115 clean → 678 MBA instructions, one straight-line block |

Read the reproducibility row twice. A pass that advertises a seed and does not
reproduce under it is a pass whose output you must retain, because you cannot
regenerate it. That is a provenance fact, not a criticism of the tool.

## What "linear MBA" does and does not promise

"Linear MBA" names a restricted algebraic class. It is not a promise of easy
native extraction. Bit width, overflow and extensions are part of the semantics:
an identity checked over the integers is a different claim from the same
identity checked modulo 2³², and the difference is where several of these
transformations hide.

## The honest scoreboard

| Result | Value |
| --- | --- |
| Sites expanded, each with a distinct operator tree | 24 / 24 |
| Isolated repeated sites recovered with both 32-bit obligations discharged | 10 / 12 |
| Isolated sites returning SMT UNKNOWN, not accepted | 2 |
| Complete recoveries among 20 extracted composed return expressions | 0 |
| Largest proved partial reduction in the composed probe | 305 → 79 AST nodes |

The third row is the week. Ten of twelve isolated sites were recovered *with
both equivalence obligations discharged*. Two returned UNKNOWN and were not
accepted — not "probably fine", not "recovered with low confidence". Not
accepted.

And on composed expressions — the realistic case, where a site's output feeds
the next site's input — no complete recovery occurred at all, while proved
partial reductions did. A 305-node tree reduced to 79 proved nodes is a real
result. It is not a recovered source line, and a report that calls it one has
changed the claim.

## Ledger

**Establishes** that linear MBA expanded all 24 sites with a distinct operator
tree at each, took the native target from 115 to 678 instructions, and survived
instruction selection at `-O0`.

**Withholds** that the simplifier "solved" the specimen. Ten of twelve isolated,
zero of twenty composed, and two UNKNOWNs that stay UNKNOWN.
