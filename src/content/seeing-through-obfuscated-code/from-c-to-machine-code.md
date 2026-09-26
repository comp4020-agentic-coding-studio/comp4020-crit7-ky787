---
title: From C to machine code
summary: One computation, four truthful descriptions of it, and the beginning of a habit — saying which description you are looking at before you say what it means.
kind: page
section: w01
position: 20
source: Reused — body condensed from comp4020-ass2-Ky787 (src/content/sessions/week-01.mdx)
---

> **This week's question.** If the source, the IR and the machine code disagree
> about how complicated a program is, which one is wrong?

Nothing is obfuscated this week. That is deliberate: you cannot tell what an
obfuscator did to a program until you can tell what a *compiler* did to it, and
the compiler already did a great deal.

## Start with the program

The whole semester runs on one small C file. This week's function:

```c
value[0] = input + 0x01010101u;
value[1] = input + 0x02020202u;
```

Eight array slots, each getting the argument plus a different constant. Later in
the same function each slot is XORed with `0x12345678`, then has `0x1337` added,
then has `0x1111` subtracted, and finally all eight are XORed together into the
return value. No loops, no branches, no calls. You could work out what it
returns on paper.

That is the point of it. Everything this course shows you happens to a function
you could have written in a first-year lab.

## The compiler's own version

A compiler does not go straight from C to machine code. It first rewrites the
program into an **intermediate representation** — still structured and typed,
much closer to what a machine does. Four words before you read any:

- **`%0`, `%4`, `%5`** — values, not variables. Each is assigned exactly once
  and never changes, a discipline called SSA. `%5` is not a box; it is the name
  of one particular result.
- **`alloca`** — reserve stack space and give me a pointer to it.
- **`getelementptr`** — compute the address of an element inside that space. No
  memory is touched.
- **`store volatile`** — write to memory, and do not optimise this away.

The IR is not more complicated because anything was hidden. It is more
complicated because it is more *explicit*. Everything the C left implied is now
written down.

## What the machine actually gets

```text
140001030: 05 01 01 01 01    add eax, 0x1010101
```

Each site is three instructions: reload the argument from the stack, add the
constant, store it back. Notice `05 01 01 01 01` — the constant you wrote,
sitting in the instruction stream, least-significant byte first.

That is the first useful fact about machine code for an analyst. **Constants are
landmarks.** They are how you find the same computation again after somebody has
rearranged everything around it.

A landmark is not a proof. Finding `0x12345678` in a binary tells you where to
look. It does not tell you that the operation around it is still the one the
source wrote, and from week 3 onward it frequently will not be.

## The counts do not agree, and that is the point

| Measurement | Value |
| --- | --- |
| LLVM IR instructions in the clean target | 155 |
| x64 machine instructions in the same function | 115 |
| Bytes of machine code, first byte to last | 467 |
| Machine instructions for the same function at `-O1` | 51 |

One function; four numbers, all correct. The IR count is higher because IR
spells out addressing that one x64 instruction does for free. The `-O1` count is
less than half the `-O0` count because at `-O0` the compiler reloads the argument
from the stack for every single site, and at `-O1` it stops bothering.

Whenever you meet a number about a program, three questions come before
believing it: **which representation, which counting convention, and against
which comparator at which optimisation level.**

## Ledger

**This week establishes** that one compiled function has several descriptions
that differ in size and shape while describing the same computation, and that
memorable constants survive clean compilation into the instruction stream.

**It withholds** any suggestion that IR and machine instruction counts can be
compared to each other, that either measures difficulty, or that a constant
found in a binary is still doing the job the source gave it.
