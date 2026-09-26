# Crit 7 — Build the ANU system you wish existed

> **Draft for Ky to finish.** The two standing prompts below are about *your*
> learning and *your* sense of yourself as a developer, and I am not going to
> put words in your mouth. What is here is the factual record of what happened
> during the build, laid out so you have something concrete to react to.
> Replace the bracketed prompts with your own answer — 150–300 words total is
> plenty — and delete this note before you submit.

## What was the breakthrough that moved the work forward?

*The record, for you to draw on:*

The design stopped being "Canvas is annoying" and became one testable sentence
— *students should have one dependable course outline* — and from that point
the architecture wrote itself. The decision that followed was to make the
outline a **derived projection** (`src/lib/outline.ts`) rather than a list
anybody maintains, and to make *Other course resources* a group computed from
the absence of a section rather than a row somebody has to remember to file
things into. The complete-outline property then held by construction, and the
tests could compare identifiers instead of counts.

The other candidate moment: the accessibility and mobile problems were only
found by driving a real browser. The mobile menu button was off the screen edge
and keyboard focus stayed behind on it when the drawer opened. Neither was
visible in the markup, and both would have broken the demo.

[ **Your answer here.** Which of those actually felt like the turn for you — or
was it something else entirely? What changed after it? ]

## What did this work change about who I want to be as a software developer?

[ **Your answer here.** Nobody can write this but you. Some things you might
have a view on, having done it:

- what it was like to hold an agent to an argument rather than to a feature
  list, and whether the constraint in `CLAUDE.md` did the work you expected;
- whether comparing identifiers rather than counts changed how you think about
  what a test is for;
- whether finding bugs by opening the thing in a browser, after the suite was
  green, changed what you now think "done" means. ]
