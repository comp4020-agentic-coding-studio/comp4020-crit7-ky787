---
title: From proof to a working binary
summary: Six bytes, of which four differ. The audit that reconciles seventy blocks with thirty-seven. And 4,591 test triples, which is a great many inputs and not all of them.
kind: page
section: w08
position: 10
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-08.mdx)
---

> **This week's question.** A solver proved an edge impossible. What has to
> happen next, and who has to do it?

The solver's job finished last week. Nothing it did changed a file.

What happens now is a different program: a patch consumer that reads the frozen
proofs, checks the bytes it is about to touch against what it expects to find,
and writes a new executable. It ran **zero** solver queries of its own, and that
separation is the reason this week's result can be stated cleanly.

## The patch

| Field | Value |
| --- | --- |
| Site | RVA `0x1667`, inside `demo_bogus_control_flow` |
| Instruction | `jne` — the gate proved one-sided in week 7 |
| Input | SHA-256 checked before writing |
| Solver runs during rewriting | zero |

A proved one-sided conditional branch becomes an unconditional `jmp` to the
reachable target, plus a padding `nop` where the shorter instruction leaves a
gap. Computing the relative displacement by hand is this week's studio.

## What changed, and what did not

| Measurement | Value |
| --- | --- |
| Proved gates rewritten as `jmp` + padding `nop` | 22 |
| Bytes changed, inside a 132-byte approved window | 88 |
| Total file size; every other byte identical | 571,904 |
| Entry-reachable blocks, before → after | 70 → 37 |
| Blocks that became unreachable | 33 |
| Of those: bogus clones / jump stubs / genuine semantic blocks | 11 / 22 / **0** |
| Differential triples across two implementations, zero mismatches | 9,189 |

The "approved window" is the discipline. The patcher was allowed to write inside
a declared byte range and nowhere else, and the audit confirms it did not. A
rewriter that can touch any byte it likes is one whose output you have to
re-verify from scratch.

The last row is where the honest limit sits. 9,189 differential triples with
zero mismatches is strong evidence. It is not a proof of whole-program
equivalence, because 9,189 inputs is a great many inputs and not all of them.

## Ledger

**Establishes** 22 gates rewritten inside an approved window, a 70 → 37
entry-reachable block drop with zero genuine semantic blocks lost, and 9,189
differential triples with zero mismatches.

**Withholds** whole-program equivalence, and any suggestion that the block-count
drop is itself evidence of correctness — week 10 contains a 56 → 10 drop that
returns the wrong answer.
