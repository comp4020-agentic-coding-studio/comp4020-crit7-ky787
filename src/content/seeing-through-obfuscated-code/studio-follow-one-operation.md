---
title: "Studio 3 — Follow one operation through the pair"
summary: Take one ADD site and one XOR site, and account for what happened to each between the source and the executable.
kind: practical
section: w03
position: 20
source: Reused — studio task from comp4020-ass2-Ky787 (src/content/sessions/week-03.mdx)
---

Take one ADD site and one XOR site. For each:

1. Write the identity the pass used, as algebra, and check it holds modulo 2³².
2. Find the site in the substituted IR and in the substituted disassembly. Note
   which IR values are dead.
3. Say what the backend did between those two files.
4. Then find the same site in the `-O1` metrics and say what is left.

Then the part that carries the marks: write two sentences about what you have
established, one of which begins **"this does not show that"**.

A1 is published now and is built from exactly this exercise on a pair you have
not seen.

## Files

| File | What it is |
| --- | --- |
| `baselines/demo_substitution.ll` | clean O0 IR — the comparator |
| `s01_ollvm_sub/target_function.ll` | post-pass substituted IR, all 24 sites |
| `baselines/demo_substitution_disassembly.txt` | clean x64, AT&T order |
| `s01_ollvm_sub/demo_substitution_disassembly.txt` | substituted x64, Intel order |
