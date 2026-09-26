---
title: Unflattening and hidden assumptions
summary: Four runs of one unmodified tool. Two working rewrites, one valid executable that returns the wrong answer, and one failure that never reached the part of the tool everybody talks about.
kind: page
section: w10
position: 20
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-10.mdx)
---

> **This week's question.** The tool exited zero and the graph got smaller. How
> would you find out whether it worked?

One tool, unmodified, pointed at four flattened functions from four
implementations. It is a reasonable tool built on a reasonable idea: discover
the dispatcher, recover each region's successors by symbolic execution, then
patch the binary so the blocks jump to each other directly.

Four runs. Four different kinds of outcome.

## The scoreboard

| Run | Outcome |
| --- | --- |
| 1 | Working canonical rewrite — 25/25 successor pairs, 60 blocks → 17 |
| 2 | Working canonical rewrite — 28/28 successor pairs |
| 3 | Structurally valid PE, 56 blocks → 10, **wrong answer** |
| 4 | Stopped at discovery — 6 blocks seen where the reference has 38 |

Keep rows 3 and 4 apart in your head. They are different failures with different
causes, and treating them as one is the most common misreading of this table.

## The one that produced a wrong answer

Run 3 returns `F9CD8332` instead of `DBEFFCE7` and exits 1. Its four legitimate
`switch` alternatives now execute **in sequence**. The tool recovered a
successor relation that was wrong in a specific, comprehensible way: it treated
alternatives as a chain.

The graph got smaller. The PE is structurally valid. Every static signal says
success.

## The one that never got started

Run 4 stopped at *discovery*. The source-level flattener it was pointed at uses
a real indirect jump through a jump table, and the tool's dispatcher discovery
looks for a comparison network. It saw 6 blocks where the jump-table-aware
reference has 38, and never reached symbolic successor recovery at all.

This is not the same failure as run 3 and it does not support the same
conclusion. Run 3 says the recovery logic can be wrong. Run 4 says the discovery
step is mechanism-specific. A report that merged them into "the tool failed on
2 of 4" would have lost both findings.

## A correct rewrite need not match the compiler

The successful run has **17** blocks against the clean build's **21**, and
retains dead state writes. That is not a defect. Expecting a deobfuscated binary
to match the clean graph is a fifth way of measuring the wrong thing.

## Ledger

**Establishes** two working canonical rewrites at 25/25 and 28/28 successor
pairs, one structurally valid PE with a 56 → 10 graph returning the wrong value,
and one discovery-stage failure at 6 blocks against a 38-block reference.

**Withholds** the idea that block-count reduction is evidence of anything except
block-count reduction.
