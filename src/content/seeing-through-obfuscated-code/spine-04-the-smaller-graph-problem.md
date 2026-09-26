---
title: "Lecture 4 — The smaller graph problem"
summary: Two results in this corpus look like successes and are not. Both were caught by running the program; neither would have been caught by looking at the output.
kind: lecture
section: w10
position: 10
source: Reused — title and argument from comp4020-ass2-Ky787 (src/content/lectures/spine-04.mdx)
---

Opens block 4, covering weeks 10 to 12. This is the course's conclusion, and
this is where it gets argued.

Two results:

- A rewrite that takes a flattened function from **56 blocks to 10**, produces a
  structurally valid executable, and returns the wrong value.
- A lift that is **verifier-clean**, recompiles, and miscomputes **3,917 of
  4,118** inputs.

Both look like successes in every static measurement anyone normally reports.
Both were caught by *running the program*.

## The argument

A smaller graph is the expected *symptom* of successful unflattening, so it is
the thing everyone measures. It is also the expected symptom of a rewrite that
dropped a case. The measurement does not distinguish them, and no amount of
looking harder at the output will make it.

The same goes for the verifier. LLVM's verifier checks that a module is
well-formed. It has no opinion about whether the module computes what the
machine code computed, and a lift that mistranslates one fold produces
well-formed IR with the wrong semantics in it.

## What follows for your capstone

Every conclusion names the level it was validated at: expression, graph, lifted
function, or executable. Four levels, and a result at one of them is not a
result at the next. If you claim a working rewritten binary, there is a runtime
record or there is no claim.
