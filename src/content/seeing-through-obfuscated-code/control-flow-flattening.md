---
title: Control-flow flattening
summary: The dispatcher, the state variable, and why the thing being hidden here is not a value but a relationship — which block runs next.
kind: page
section: w09
position: 10
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-09.mdx)
---

> **This week's question.** If every block returns to the same dispatcher,
> where did the program's structure go?

Everything so far hid a *value* — what an expression computes, or which way a
branch goes. Flattening hides something else: **the edges**. Every semantic
block still exists and still does its job, and no block any longer says which
block comes after it. That fact is now held in a number.

## What is being flattened

The target has three regions: an if/else on parity, a four-iteration loop with a
condition inside it, and a four-way `switch` on the low two bits whose cases all
reconverge. Then a final XOR against `0xCAFEBABE`. The clean build of that is
21 blocks and 26 edges, and you could sketch it from the source.

## After the pass

| Measurement | Value |
| --- | --- |
| Clean blocks → flattened blocks (Miasm convention) | 21 → 60 |
| State held in | a stack DWORD, randomised 32-bit constants |
| One source branch, as states | 3 states, each with a named successor |
| Source-level flattener: state / dispatch | QWORD state, real indirect jump |
| Its verified RVA table | 21 entries, indexed by state − 1 |

The successor relation is carried by the **state stores**, not by any
control-flow edge. That is why a recovered CFG of a flattened function looks
like a star: every block points at the dispatcher, and the dispatcher points at
everything. The graph is not wrong. The information simply is not in it.

Two mechanisms appear in this corpus and they are genuinely different. The
LLVM-family pass mediates blocks with a `switch` on a stack DWORD. The
source-level flattener uses a QWORD state, a real indirect jump, and a jump
table — which means a tool that only knows how to find a `switch` comparison
network will not find its dispatcher at all. Week 10 contains exactly that
failure.

## Ledger

**Establishes** that the clean function's 21 blocks become 60 under the stated
convention, that the successor relation is carried by state stores, and that the
source-level flattener uses a different mechanism with a verified 21-entry RVA
table.

**Withholds** any comparison between these block counts and the PE-byte audit
counts of week 6 and 8. Different convention, different numbers.
