---
title: "Studio — Refactor a long function"
summary: Take a forty-line function that works and split it into named pieces without changing what it does.
kind: practical
section: w08
position: 20
source: Newly written demonstration material for this prototype
---

You are given a forty-line function that works. It reads a list of records,
filters them, computes two totals and prints a summary.

1. Run it. Record the exact output for the supplied input — this is your
   comparator, and you will check against it after every change.
2. Find the three decisions buried in it. Give each a name.
3. Extract each into its own function, one at a time. Re-run after each
   extraction and compare with your recorded output.
4. When you are done, the original function should be about eight lines and
   should read like a description of what it does.

Do not change behaviour and structure in the same step. If the output changes
after an extraction, the extraction is wrong — revert it and try again rather
than adjusting the comparator.

That discipline is the whole studio. It is also the discipline behind every
piece of assessment in this course.
