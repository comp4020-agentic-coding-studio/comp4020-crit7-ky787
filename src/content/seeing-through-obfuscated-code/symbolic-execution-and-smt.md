---
title: Symbolic execution and SMT
summary: One branch, two queries, and a solver that answers one with a witness and the other with nothing at all. Plus the assumption that turns zero proofs into three.
kind: page
section: w07
position: 20
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-07.mdx)
---

> **This week's question.** What exactly has a solver established when it
> returns UNSAT for one direction of a branch?

Last week ended with a hand argument and a hole in it: the product of two
consecutive integers is even, *over the integers*, and the machine works modulo
2³². This week we stop arguing and write the obligation down.

## Symbolic execution, in one paragraph

Instead of running the function on a value, run it on a *variable*. Every
instruction updates an expression rather than a number: `and eax, 1` turns the
expression in `eax` into `bvand(previous, 1)`. When you reach a conditional
branch you have an expression for its condition, in terms of whatever you left
symbolic. Then you can ask a solver about it.

**What you left symbolic is the whole ballgame.** Here, the two globals the
predicate reads are symbolic — nothing else about the program's state is. That
choice is the analysis's model, and every result below is a result *about that
model*.

## One frozen gate

For the gate at RVA `0x1667`, with two globals symbolic and an empty path
prefix:

- the **taken** direction is **SAT**, with a recorded satisfying model;
- the **fall-through** is **UNSAT**.

UNSAT here means: no assignment to those two globals makes the fall-through
condition true. Under this model, that direction is unreachable. It does not
mean the fall-through is unreachable in the whole program under all states —
that is a larger claim needing a larger model.

SAT, correspondingly, gives a counterexample *within the model*, not
automatically a reachable whole-program input.

## The generic result

| Finding | Value |
| --- | --- |
| Injected gates proved one-sided across two `-O0` implementations | 38 / 38 |
| Genuine source branches correctly left two-sided | 16 / 16 |
| False positives | 0 |
| State-dependent implementation, generic yield | 0 of 3 |
| Same implementation, under one captured initialised state | 3 of 3 |

The last two rows are the week's real lesson. The same harness, the same
binary, the same three gates: zero proofs generically, three proofs under a
captured state. The difference is not a better technique. It is an **added
assumption**, and a result obtained under it has to carry it.

A result that says "3 of 3 gates proved" without saying "under one captured
initialised state" is not a stronger result. It is the same result with the
model deleted.

## Ledger

**Establishes** the SAT/UNSAT pair for the frozen gate under a named model, and
a 38/38 with 16/16 and zero false positives across two implementations.

**Withholds** any claim that an UNSAT under a path prefix is a program
invariant, or that the state-assumed 3 of 3 is comparable with the generic 0 of 3.
