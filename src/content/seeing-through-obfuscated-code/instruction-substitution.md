---
title: Instruction substitution
summary: The oldest trick in the book, applied to twenty-four sites, and largely undone by the compiler backend before anyone tried to analyse it.
kind: page
section: w03
position: 10
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-03.mdx)
---

> **This week's question.** If the obfuscator expanded every single addition,
> why can I still see additions in the machine code?

Instruction substitution replaces an operation with a longer sequence that
computes the same value. For addition, one of the classic identities is

```text
a + b   ≡   (a + k) + b − k        for any k, modulo 2³²
```

which is true for every `k`, costs two extra instructions, and means nothing to
a reader who spots the cancelling constant. That is the whole technique. The
interesting question is what happens to it on the way to the executable.

## One site, before and after

Week 1 introduced SSA — every value named once, never reassigned. That property
is what makes the listing readable: to find out what a pass did, follow the
chain of names backwards from whatever gets stored.

In the substituted IR, `%5` adds the cancelling constant, `%6` adds the real
one, `%7` subtracts the cancelling constant back out, and `%7` is what gets
stored. Then note `%8`: the pass also emitted the *original* `add i32 %4,
16843009` and never used it. The unsubstituted operation is sitting right there
in the IR as dead code.

Two things follow immediately. First, `k` is different at every site — the next
one uses `−2076646197`, the one after that a zero-subtract form entirely — so
pattern-matching one template does not find the others. Second, the dead `%8`
tells you the pass works by adding a substituted computation *beside* the
original rather than editing it in place.

## The same site, in the executable

The dead operation is gone: instruction selection dropped it, at `-O0`, without
being asked. What survived is the three-instruction identity — `add` the
cancelling constant, `add` the real one, `sub` the cancelling constant — and
`0x1010101` is still sitting in plain sight in the middle of it.

**Read the operand order before you compare.** The retained clean baseline is
AT&T order — `addl $0x1010101, %eax`, source first. The substituted target is
Intel order — `add eax, 0x1010101`, destination first. Same instructions,
mirrored operands. This is an artefact of how each dump was taken, not of the
transformation, and noticing it is the cheapest provenance lesson in the course.

## Coverage, diversity and survival are three things

| Measurement | Value |
| --- | --- |
| Intended sites expanded in the O0 IR | 24 / 24 |
| Distinct IR template shapes used (2 XOR, 4 ADD, 3 SUB) | 9 |
| Native instructions in the target, clean → substituted, at O0 | 115 → 311 |
| Intended native operations recognisable again at O1 and above | 24 / 24 |

**Coverage** is how many sites the pass touched: all of them. **Template
diversity** is how many distinct shapes it used: nine, which is more than one
and far fewer than twenty-four. **Survival** is what is left in the machine
code, and this is where it falls apart — the post-pass IR keeps its expanded
trees at every optimisation level, and the backend selects native immediate
operations for all twenty-four target sites from `-O1` onward.

The same three measurements on two other implementations make the point harder
to dismiss. One transformed XOR 2/8, ADD 4/8 and SUB 6/8 at `-O0` — its pass is
probabilistic — and by `-O1` its measured target was *identical* to the clean
target: complete loss of the requested treatment.

## Ledger

**Establishes** that this specimen's 24 sites were expanded using nine template
shapes and grew the native target from 115 to 311 instructions, and that from
`-O1` onward instruction selection recovers all 24 native operations.

**Withholds** that IR expansion produces hard machine code, that a simplifier
recovered anything (nothing was simplified this week — the compiler did it,
before any analysis ran), and that 311 versus 115 instructions is a measure of
difficulty rather than of size.
