---
title: Tools, and what each one actually produced
summary: A catalogue organised around one column — did this tool produce a working rewritten binary of the original specimen? For most of them the answer is no, and that is not a criticism.
kind: reference
position: 30
source: Reused — framing and the outputs argument from comp4020-ass2-Ky787 (src/pages/tools/index.astro)
---

Course-wide reference. No week owns it.

Tool catalogues usually list capabilities. This one lists **outputs**, because
the difference between an expression, a proof, a graph, a lifted module and a
rewritten executable is the difference this course exists to teach.

A tool that emits a simpler expression has done something valuable and has not
deobfuscated a binary. Saying so is not a complaint about the tool.

## What each class of workflow emits

| Workflow | Input | Output | The boundary on it |
| --- | --- | --- | --- |
| Expression simplifier | an extracted expression | a shorter expression | equivalence only if the obligations were discharged |
| SMT branch prover | a gate plus a model | SAT / UNSAT / UNKNOWN | holds under the stated model and path prefix |
| Patch consumer | frozen proofs plus a binary | a new executable | only inside the approved byte window |
| Unflattener | a flattened binary | a rewritten binary | correct only if successor recovery was correct |
| Lifter | machine code | LLVM IR | well-formed is not faithful |

## Obfuscators

Four compilers and one post-link rewriter appear in the corpus. Note that
"working rewritten binary?" here asks about *deobfuscation* of the original
specimen — an obfuscator producing a valid obfuscated program is the **input**
to this course, not an output of it.

One post-link tool's eight tested protected outputs all failed at runtime: seven
access violations and one hang. They remain in the corpus as static-analysis
evidence only.

## Manual inspection

No core exercise requires a paid decompiler or a commercial binary-analysis
platform. Every studio has a route that works from the supplied source, IR, text
disassembly, result files and SVGs — on Linux, offline. A disassembler makes
some of them faster and none of them possible.
