---
title: Lifting machine code back to LLVM IR
summary: One tool, one afternoon, two verdicts. Sixty-eight verifier-clean LLVM modules, one of which miscomputes 3,917 of 4,118 inputs — and the fold that did it is four operators long.
kind: page
section: w11
position: 10
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-11.mdx)
---

> **This week's question.** The lifted IR verifies, recompiles and is smaller
> than the machine code. Is it right?

Lifting runs the pipeline backwards. Take a compiled function, translate each
instruction into an intermediate representation with defined semantics, and you
have something an optimiser can simplify, a solver can reason about, and a
person can read.

It is the most appealing idea in the field, and week 11 exists because of what
that appeal does to your judgement.

## The study

| Measurement | Value |
| --- | --- |
| Functions lifted | 17 |
| Stage variants each, so modules | 4 → 68 |
| Modules verifier-clean and recompilable | 68 / 68 |
| Stages executed against test vectors | 51 |
| Test vectors in total | 218,334 |
| Stages passing | 47 |
| Cases with passing runtime outcomes under their documented contracts | 13 / 17 |

Read row three against row seven. **Every** module was well-formed. Thirteen of
seventeen cases were right.

## The two cases to remember

The **MBA case** matches all 4,118 vectors at every stage while retaining
substantial residual arithmetic — 372 arithmetic and Boolean instructions in the
internal stage. Correct, and not simplified. Those are separate axes.

The **substitution case** miscomputes 3,917 of 4,118 inputs at all four stages,
with the defect already present in the raw lift. Its native input passes. So the
program was fine and the translation of it was not.

## The fold

The defect is one unsound rewrite, four operators long:

```text
(~A & B) | (A & C)   →   select(A, C, B)
```

justified by known-bits extrema. It is consistent with the emitted IR, it looks
like a standard canonicalisation, and it is refuted by `A = 1, B = 0, C = 2`.

Work that out by hand before reading on. It takes about a minute, and the minute
is the week: a wrong fold in a lifter is not exotic, it is four operators, and
nothing in a verifier or a recompile will find it.

## Ledger

**Establishes** that all 68 lifted modules were verifier-clean and recompilable
while 13 of 17 cases passed at runtime, that the MBA case matches all 4,118
vectors while retaining 372 arithmetic and Boolean instructions, and that the
substitution case miscomputes 3,917 of 4,118 inputs from the raw lift onward.

**Withholds** any inference from well-formedness to faithfulness. Verifier-clean
is a statement about the module, not about the program it came from.
