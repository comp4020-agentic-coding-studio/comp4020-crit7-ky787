---
title: "External: LLVM Language Reference"
summary: The primary reference for LLVM IR syntax and instruction semantics. Use it whenever a week page says "check this against the primary source".
kind: external
externalUrl: https://llvm.org/docs/LangRef.html
position: 40
source: Newly added demonstration link — an external resource recorded in the outline rather than buried inside a week page
---

The authoritative definition of LLVM IR: types, the SSA form, and the exact
semantics of every instruction weeks 1, 3, 4 and 11 read.

Two sections carry most of the weight for this course:

- **Instruction Reference** — for `add`, `xor`, `icmp`, `select`, `getelementptr`
  and the `volatile` qualifier.
- **Poison and undefined behaviour** — for why an "obviously equivalent" rewrite
  can be unsound.

The course records the resource, not its contents. This outline lists the
reference; it does not attempt to enumerate the pages inside it.
