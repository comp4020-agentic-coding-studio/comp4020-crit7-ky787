---
title: Optimization versus obfuscation
summary: The compiler flag is part of the experiment. Change it and a transformation can halve, double, or vanish — while the obfuscator's own output file stays exactly the same.
kind: page
section: w05
position: 10
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-05.mdx)
---

> **This week's question.** Is this result about the obfuscator, or about the
> optimisation flag that came after it?

Week 3 ended with a transformation that mostly stopped existing when the
optimiser was turned on. That was not an accident of that tool. Optimisation
level is not a nuisance variable in this field — it is part of the treatment.

## How to control for it

Two different problems, two different answers.

For the **source-level** lane the problem is easy to state and easy to get
wrong: if you generate obfuscated C four times, once per optimisation level, you
have four specimens and no control. So generate the C **once** and compile that
exact file at every level. The retained metadata records prove the input file
was identical across the pair.

For the **IR-level** lane the pass runs inside the compiler, so the pass output
and the optimisation level cannot be separated in the same way. There the
comparator has to be a clean build at the *same* level, and every count has to
name it.

## What changes when the flag changes

| Finding | Value |
| --- | --- |
| One generated C file at two levels: target instructions | 426 → 226 |
| Matched clean comparators at the same two levels | 249 → 106 |
| Surviving ratio at maximum optimisation | ≈ 2.1× |
| Bogus-control-flow lanes structurally identical to clean from `-O1` | 2 of 4 |
| Flattening lanes surviving every level tested | 4 of 4 |

Read rows one and two together. The absolute instruction count halved, and the
*ratio against its own comparator* barely moved. A report quoting only the first
number would say the obfuscation was largely optimised away. A report quoting
the ratio says it survived at roughly twice the clean size. Both numbers are
correct and they support opposite headlines.

Rows four and five are the reason the course does not have a single "does
obfuscation survive optimisation" answer. Two of the four bogus-control-flow
implementations are *structurally identical to their clean comparator* from
`-O1` onward in the measured target: there is nothing left to analyse.
Flattening, in every implementation tested, survived every level — though one
changed its native dispatch form between an indirect jump table and a
comparison network, which is itself a result you would miss if you only counted
blocks.

## Ledger

**Establishes** that the same generated source at two optimisation levels gives
a surviving ratio of roughly 2.1×, that two of four BCF lanes are structurally
identical to clean from `-O1`, and that flattening survived every level tested.

**Withholds** that any of this transfers to another program, another seed or
another compiler build. Also withholds the idea that "survives optimisation" is
a property of a technique rather than of an implementation at a level.
