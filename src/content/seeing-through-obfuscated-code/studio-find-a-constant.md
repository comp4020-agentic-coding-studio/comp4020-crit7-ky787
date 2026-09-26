---
title: "Studio 1 — Find a constant, then follow its meaning"
summary: Locate one XOR site in all three representations, say what the compiler added around it, and write the sentence you will repeat all semester.
kind: practical
section: w01
position: 30
source: Reused — studio task from comp4020-ass2-Ky787 (src/content/sessions/week-01.mdx)
---

Working from the four supplied files, and nothing else.

1. Pick one of the eight XOR sites. Locate it in the C, in the IR, and in the
   disassembly. Write down the line or address of each.
2. Say what the compiler added around it that the author did not write, and why
   each addition is there.
3. `demo_substitution` contains more than twenty-four operations. Twenty-four of
   them are the repeated sites the corpus was designed around; the rest are
   setup and the final reduction. Mark which is which, and say how you decided.
4. One sentence, to be repeated all semester: *what would have to be true for my
   answer to step 1 to be wrong?*

Bring the answers to step 3 and step 4. Step 3 is where people disagree, and the
disagreement is the useful part — the corpus documentation says "twenty-four
sites" and does not mean "twenty-four instructions".

## Files

| File | What it is |
| --- | --- |
| `showcase.c` | the frozen source, all six functions |
| `baselines/demo_substitution.ll` | clean LLVM IR for this week's function |
| `baselines/demo_substitution_disassembly.txt` | clean x64 disassembly of the same function |
| `baselines/run_stdout.txt` | what the clean executable prints — the six canonical answers |

## What is being assessed

Nothing. This studio is not marked. It exists because A1 is built from exactly
this exercise on a pair you have not seen, and the people who do badly at A1 are
reliably the people who skipped this.
