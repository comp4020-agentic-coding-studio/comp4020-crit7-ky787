---
title: Bogus control flow and opaque predicates
summary: Four branches the programmer wrote, twenty-two a tool injected, and the question of how you tell them apart when you do not have the source.
kind: page
section: w06
position: 10
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-06.mdx)
---

> **This week's question.** Which of these twenty-six conditional branches did
> the programmer actually write?

Bogus control flow adds branches that never go both ways, guarded by predicates
whose value the transformer knows and the analyst is supposed not to. It also
clones real code, so that the branch has somewhere plausible to go.

The definitions this page leans on — **opaque predicate**, **basic block**,
**CFG**, **bogus control flow** — are all in
[Obfuscation terminology](/c/seeing-through-obfuscated-code/obfuscation-terminology/),
with the qualification attached to each. Read the second half of each definition
there before you read the rest of this page; most of the trouble in this topic
is a term quietly changing scope.

## The four genuine conditions

The target for this week and the next two was written to make the distinction
checkable. It has exactly four conditions, each with a constant you will
recognise on sight: an equality test against `0x1337`, a threshold against
`0x12340000`, a low-byte test against `0x37`, and a parity test. Eleven blocks,
fourteen edges, four conditional branches — that is the whole function.

Every one of those four is **path-dependent**: whether it is taken depends on
the arguments, and both directions are reachable. Keep that word. An opaque
predicate is not "a branch whose outcome depends on something obscure" — it is
a branch one of whose directions is *unreachable*, by construction, and the
whole of week 7 is about how you would show that.

## What the pass adds

Read the injected gate instruction by instruction. Two `mov`s load a pair of
writable globals through RIP-relative addressing. Then `edx = eax − 1`,
`imul eax, edx`, `and eax, 1`, `cmp eax, 0`, `sete al`. That is the algebraic
half: **g · (g − 1) & 1 == 0**. The other half is `cmp ecx, 0xa` / `setl cl` — a
signed comparison of the second global against ten. `or al, cl`, `test al, 1`,
and the `jne` goes to the real code while the fall-through goes to a stub.

So the gate is a disjunction, and its first disjunct is the interesting one: the
product of two consecutive integers is even, so the low bit is zero, so the
`sete` always sets `al` — which makes the whole `or` always true and the branch
always taken.

*Over the integers.* Over 32-bit values with wraparound you would want to check,
and "I can see it is always true" is not a check. Week 7 stops arguing and
proves it instead.

Note also why the globals are there at all. A predicate over initialised
constants would fold away during compilation. A predicate over *writable*
globals cannot be folded, because the compiler cannot prove that nothing writes
them — which is the same fact the analysis in week 7 has to work around.

## The counts

| Measurement | Value |
| --- | --- |
| Conditional branches in the treated target | 26 |
| Of them, injected opaque gates | 22 |
| Genuine source conditions, all two-sided | 4 |
| Entry-reachable blocks, clean → treated | 11 → 70 |

## Four implementations, four different amounts of nothing

One implementation's `-O0` IR has the same 44-block / 69-edge topology as the
specimen above. Its *machine code* has 15 blocks and 18 edges. The reason is
that most of its injected guards are literal `icmp eq i32 1, 1`, and the backend
folds those without being asked. The four conditional jumps that survive into
its machine code are **the four genuine source conditions**.

So when the week 7 workflow runs on that binary and proves zero injected gates,
that is not a failure of the workflow. There were no injected gates left in the
machine code to prove anything about. Crediting those four surviving branches as
"removed injected predicates" would invert the result completely — and it is
exactly the kind of mistake a workflow reporting only successes would make.

## Ledger

**Establishes** that the treated target has 26 conditional branches — 22
injected and 4 genuine — with source and IR provenance separating them, and that
entry-reachable blocks go from 11 to 70 under the PE-byte audit convention.

**Withholds** that any of the 22 injected branches is one-sided. Nothing this
week proves that; the provenance says they were *injected*, which is a different
claim. Also withholds that 70 blocks is comparable with a block count from the
unflattening study — different convention, different numbers.
