---
title: "Lecture 3 — What a proof is worth"
summary: A solver can show a branch has only one reachable outcome. Turning that into a working executable takes a separate tool, and neither step is the same as knowing the program is still correct.
kind: lecture
section: w07
position: 10
source: Reused — title and argument from comp4020-ass2-Ky787 (src/content/lectures/spine-03.mdx)
---

Opens block 3, covering weeks 7 to 9.

Three things that are routinely reported as one:

1. **An analysis result.** The solver returned UNSAT for one direction of one
   branch, under a stated model, with a stated path prefix.
2. **A produced artefact.** Some program read that result and wrote different
   bytes to a file.
3. **A validated program.** The new file was executed and produced the right
   answers on some set of inputs.

Each of the three is a separate obligation with a separate failure mode. A
result that has (1) and claims (3) is the shape of almost every overstatement in
this field.

## Why the separation is load-bearing

In this course's corpus, proof generation and patch application are two
programs. The patch consumer ran **zero** solver queries of its own: it read the
frozen proofs, checked the bytes it was about to touch against what it expected
to find, and wrote a new executable. That separation is exactly why week 8's
result can be stated cleanly — the rewriting step cannot have quietly re-proved
anything to make its own job easier.

## The obligations

For a branch you want to call one-sided, you owe two things, not one:

- a formula whose UNSAT means the direction is unreachable **under your model**;
- an argument that your model is faithful to the machine — bit width, memory,
  and what you left symbolic.

The second is not a formality. Week 6 ended with a hand argument that was
correct over the integers and silent about wraparound.
