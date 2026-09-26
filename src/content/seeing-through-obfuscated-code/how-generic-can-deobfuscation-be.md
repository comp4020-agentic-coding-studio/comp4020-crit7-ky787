---
title: How generic can deobfuscation be?
summary: The one week with no new evidence. What transferred between implementations, what did not, and the protocol for choosing a method when nobody tells you what was done to the binary.
kind: page
section: w12
position: 10
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-12.mdx)
---

> **This week's question.** Given an unfamiliar obfuscated function, what would
> you do first, and what would you have to check?

No new specimens this week. Everything below has already appeared; the work is
putting it in one place and drawing the conclusion it supports.

## Everything, on one table

Eight cases. All eight inputs were working programs. The output column is where
they diverge, and it has four distinct values in it: **produced**, **not
produced**, **wrong**, and **nothing at all**.

That four-way split is the course's result. A field that reports outcomes as
"worked / did not work" cannot express two of those four.

## What transferred

Three things crossed an implementation boundary in this corpus, and all three
carry an explicit model plus a separate validation step.

1. **The branch proof plus a separate patcher.** A generic symbolic harness
   proved 38 injected gates one-sided across two implementations while leaving
   16 genuine conditions two-sided, with no false positives. A separate program
   turned those proofs into changed bytes: 9,189 differential triples, zero
   mismatches.
2. **Isolated-site MBA recovery with discharged 32-bit obligations** — which
   transferred, and stopped transferring the moment expressions were composed.
3. **The measurement discipline itself.** Naming the convention is the only
   thing in this course that worked on every specimen.

## What did not

Six specific non-transfers are documented, each with the specimen that
demonstrates it, including the seed, the optimisation level and the state
assumption. The headline two:

- Dispatcher discovery is **mechanism-specific**. A comparison-network finder
  does not find a jump table.
- Opaque-predicate proving is **state-model-specific**. Generic yield 0 of 3;
  yield under one captured initialised state 3 of 3.

## The protocol

Given an unfamiliar function, in order:

1. Establish a comparator. Without one, no count you produce means anything.
2. Identify the representation you can actually work in, and say why.
3. Name your model before you run anything — what is symbolic, what is assumed.
4. Choose the method whose assumptions your model satisfies.
5. Validate at the level you intend to claim, and claim no higher.

## Ledger

**Establishes** that three methods transferred across implementation boundaries
in this corpus, that six specific non-transfers are documented, and that two
results here are valid-looking failures caught only by execution.

**Withholds** any general claim about deobfuscation. Twenty-one specimens and
one 483-line program can support a lot of true statements and almost no general
ones.
