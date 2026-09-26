---
title: What this course does and does not claim
summary: Every empirical statement on this site, paired with the overclaim it is routinely confused with.
kind: reference
position: 20
source: Reused — argument and "four things this site will never say" from comp4020-ass2-Ky787 (src/pages/claims/index.astro)
---

Course-wide reference. No week owns it.

A course built on twenty-one specimens and one 483-line program can say a lot of
true things and almost no general ones. The distinction is not modesty, it is
the subject: the two most instructive results here are a rewrite that looks
correct and is not, and a lift that verifies and miscomputes. Both would have
been reported as successes by anyone willing to describe their evidence loosely.

## The scope checklist

Every page on this site was written against this list, and A1, A2 and the
capstone are marked against it:

- name the specimen and the optimisation level;
- identify the representation and the metric convention;
- link the retained evidence;
- state the relevant input and state assumptions;
- distinguish SAT, UNSAT and UNKNOWN;
- say whether an executable was actually produced, and whether it was validated.

## Four things this course will never say

1. **That the third unflattening run worked.** It produces a smaller graph and
   the wrong answer, and it is in the course as a failure.
2. **That a smaller control-flow graph is evidence of correct deobfuscation.**
3. **That verifier-valid LLVM IR is evidence of a faithful lift.** One retained
   lift is verifier-clean and wrong on 3,917 of 4,118 inputs.
4. **That a result obtained under a captured state is comparable with one
   obtained without it.** Zero of three becomes three of three, and the
   difference is an assumption, not a technique.

## Two conventions that do not mix

Two control-flow-graph conventions appear in this course's evidence. The
PE-byte audit used for the branch-rewriting study does **not** split blocks at
calls and treats `ret` as terminal. The recursive graphs used for the
unflattening study **do** split at calls. Counts from the two are not
interchangeable, and every page that quotes one says which.
