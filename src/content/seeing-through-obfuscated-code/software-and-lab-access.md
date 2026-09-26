---
title: Software and lab access
summary: What you need installed, what the lab image is for, and why every core exercise has a route that works offline on any platform.
kind: page
section: info
position: 30
source: Reused — lab access and execution boundary from comp4020-ass2-Ky787 (src/pages/tools/index.astro)
---

No core exercise in this course requires a paid decompiler or a commercial
binary-analysis platform. Every studio has a route that works from the supplied
source, IR, text disassembly, result files and SVG graphs — on Linux, offline.
A disassembler makes some of them faster and none of them possible.

## What you need

- A text editor and a terminal.
- Python 3.11 or later, for the solver exercises in weeks 7 and 8.
- An SMT solver on your path for week 7.
- Optional: any disassembler you already know.

## The execution boundary

All twenty-one specimens are Windows x64 PE files. **Reading** them — source,
IR, disassembly, graphs, result files — works on any platform, and that is the
route every core exercise uses. **Executing or debugging** them needs the
course's Windows x64 lab image.

No Wine or Linux-rebuild equivalence is claimed. A Linux rebuild would be a
different specimen with a different ABI and different lowering, and it must not
be silently substituted for these results.

## Two names that collide

**Triton** in this course is the dynamic binary-analysis and SMT framework. It
is not the GPU kernel compiler of the same name, and searching for the wrong one
will waste an afternoon.

**Virtualization** here means translating protected behaviour into custom
bytecode run by an embedded interpreter. It does not mean the virtual machine
the lab image runs in. No virtualization or devirtualization experiment was
performed in this corpus, so week 12 treats it as an endpoint the course can
point at and cannot measure.
