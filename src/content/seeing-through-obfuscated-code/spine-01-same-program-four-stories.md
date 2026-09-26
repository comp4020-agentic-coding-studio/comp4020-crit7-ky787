---
title: "Lecture 1 — Same program, four stories"
summary: Why a compiler already makes a program harder to read before anyone tries to, and what it means to say two very different listings are the same function.
kind: lecture
section: w01
position: 10
source: Reused — title and argument from comp4020-ass2-Ky787 (src/content/lectures/spine-01.mdx)
---

Opens block 1, covering weeks 1 to 3.

A compiler is already an obfuscator, in the narrow sense that matters here: it
changes the representation of a program without being asked to preserve
anything a reader cares about. `-O0` output is nearly a transliteration of the
C. `-O1` output is not. Neither is wrong.

So before any obfuscator is introduced, the lecture establishes what "the same
function" is allowed to mean. Four descriptions of one computation:

1. **The source.** What the author wrote.
2. **The IR.** What the front end restated it as — still structured and typed,
   much closer to what a machine does, and where most obfuscators act.
3. **The machine code.** What the back end selected, and what actually runs.
4. **The recovered control-flow graph.** What a *tool* reconstructed from the
   machine code. It is not stored in the file.

The fourth is the one people trust too much. It is the only one of the four
that is an inference.

## What the lecture argues

That a count is meaningless without its representation and its convention. The
same function in this course's corpus is 155 IR instructions, 115 machine
instructions and 467 bytes. All three numbers are correct. None of them is a
measure of how hard the function is to understand.

## Where it goes next

Week 2 turns "obfuscation" into a definition with checkable consequences.
Week 3 applies the oldest technique in the field and watches the compiler undo
most of it.
