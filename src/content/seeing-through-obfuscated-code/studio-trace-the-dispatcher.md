---
title: "Studio 9 — Trace the dispatcher"
summary: Build the state table for one region by hand, and then say what the recovered graph could not have told you.
kind: practical
section: w09
position: 20
source: Newly written demonstration material for this prototype, following the studio pattern in comp4020-ass2-Ky787 (src/content/sessions/week-09.mdx)
---

Working from the flattened disassembly and the clean comparator.

1. Find the dispatcher. Say what it switches on and where that value lives.
2. Take the parity branch — one `if`/`else` in the source. Find every block that
   writes the state variable on that path, and record the constant it writes.
3. Build the state table for that region: state in, block, state out.
4. Now compare your table with the clean graph. Which edges did you recover, and
   which did you infer?
5. One sentence: what would the recovered CFG alone have told you about this
   region, and what did it take your table to establish?

Step 5 is the point of the studio. Keep the answer — A2 asks for the same
distinction on a function you have not seen.

## Files

| File | What it is |
| --- | --- |
| `showcase.c` | the frozen source, `demo_flattening` |
| `s04_ollvm_fla/before_cfg.txt` | flattened blocks and edges |
| `s04_ollvm_fla/clean_cfg.txt` | the clean comparator, 21 blocks |
