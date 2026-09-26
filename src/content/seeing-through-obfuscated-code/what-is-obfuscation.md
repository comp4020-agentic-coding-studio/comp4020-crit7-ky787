---
title: What is obfuscation?
summary: Five tools, one program, and a definition strong enough to be useful — which means one that tells you what evidence would show whether anything happened.
kind: page
section: w02
position: 10
source: Reused — definition, argument and ledger from comp4020-ass2-Ky787 (src/content/sessions/week-02.mdx)
---

> **This week's question.** An obfuscator ran and exited zero. What has it
> actually done, and what would show that?

A working definition, and then five hours of trouble with it:

> **Obfuscation** is a transformation applied to a program that is intended to
> preserve its observable behaviour while making some specific analysis of it
> more expensive.

Everything interesting is in the two vague words. *Which* analysis, and
*preserve* according to whom. This week is about turning both into questions
with answers you can check.

## Which analysis, and at which representation

An obfuscator does not make a program "harder". It makes one particular way of
looking at the program harder, and it does that at one particular point in the
pipeline.

| Acts on | Has to survive | Consequence |
| --- | --- | --- |
| C source | the entire native compiler | the optimiser gets a full pass at it |
| LLVM IR | the back end | instruction selection can undo it |
| Machine code, post-link | nothing | no optimiser runs afterwards |

The last row is the one to hold on to. A source-level transformation has to
survive everything after it; a post-link transformation has no optimiser after
it at all. In week 5 we find that this difference decides whether some
transformations exist in the final binary **at all**.

## Preserve according to whom

"Exited zero" is not evidence of anything. A tool that emits a file has emitted
a file. The checkable questions are:

- Does the output still run?
- Does it produce the canonical answers for the canonical inputs?
- Did the transformation the tool names actually appear in the output, and in
  which representation?

Those three come apart more often than you would expect. In this course's
retained matrix, all 68 planned conditions produced working Windows x64
executables from the frozen source — and separately, all eight tested protected
outputs from one post-link tool failed at runtime: seven access violations and
one hang. Those eight are static-analysis evidence only. They are in the corpus,
and nothing that requires running them can be claimed about them.

## Annotation is not targeting

On the tested builds of two implementations, annotation-only targeting compiled
without transforming the target function at all. The retained builds therefore
used global switches. This is the sort of thing that is invisible unless you
check the output rather than the exit code, and it is why every specimen in this
corpus is accompanied by a record of what was actually found in it.

## Ledger

**Establishes** that obfuscation is applied at a specific representation and
that the choice determines what stands between the transformation and the final
binary.

**Withholds** any claim that a tool's documentation describes its output, or
that a program which builds is a program which runs.
