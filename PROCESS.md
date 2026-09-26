# Process overview

## What I built

**Course navigator**: a student-facing replacement for course navigation in
Canvas, built on the crit 7 starter — Astro with a Node backend, Drizzle and
SQLite on a Fly volume. `README.md` is the account of what it is and what good
means here. This file is how it got built.

## How I got here

### The brief was already an argument

I did not start from "redesign Canvas". I started from one complaint I could
state precisely: **the Modules list is not a dependable inventory of what I can
access**, because some resources are only reachable through a link inside
another page. Everything else — the fragmentation between global menu, course
menu, flyouts and the right-hand column — is annoying, but it is a layout
problem. That one is a *correctness* problem, and it is the only one a database
can actually fix.

So the design argument became a sentence, and the sentence went into
`CLAUDE.md` before any code: *students should have one dependable course
outline, and useful marks and feedback should remain easy to see.*

The harness was merged rather than overwritten in
[`98bf818`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/98bf818). The starter's `CLAUDE.md` arrives with one
instruction in it — read the brief and the spec before planning — so that is
kept as its own section with the project rules underneath, and nothing about
the starter's plumbing is restated in a file that would then drift from it.

### Grounding the agent, and the one instruction that mattered

The prompt I directed the build with was long, but the line that shaped the
code was this one:

> Use one underlying set of course content records for navigation, the full
> contents page and search. Do not hard-code a separate sidebar catalogue.

That is not a feature request, it is an architectural constraint, and it is
worth more than the rest of the prompt put together. It became
`src/lib/outline.ts`: a single pure function, `buildOutline`, over content
rows, called by the navigation, the contents page, the resource count, the
previous/next links and search. A "prettier dashboard" would have been a
morning's work and would have made no claim worth testing.

The second constraint that paid for itself:

> A visible item without a section must automatically appear under Other course
> resources, in a deterministic order.

Making the fallback group **derived** rather than a seeded row is the whole
design in miniature. There is no row to forget to create and no list to forget
to add to; an unfiled resource is collected because it is unfiled.

The end-to-end slice — schema, seed, outline, resource pages, anonymous
sessions, saves and notes — landed in [`bafef98`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/bafef98), with the
starter's guestbook retired and its SSE endpoint kept and repurposed.

### Where I corrected it

**The tests were measuring the wrong thing first.** My initial check compared
the number of items in the outline with the number of content records. Counts
are worthless here: two lists of the same length can be different lists. The
spec now compares **identifiers**, and the ground truth is read straight off
disk in `spec/content.ts` rather than through the application — so if the
outline and the files ever disagree, the test knows, instead of the app
confirming itself. That is [`3275487`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/3275487).

**The browser found three things reading the source did not.** I drove headless
Chromium over the DevTools protocol rather than trusting the markup:

- the mobile **Menu** button was being pushed off the screen edge by the
  prototype label, so on a phone there was no way to open the navigation at
  all — the one failure that would have destroyed the demo;
- pressing Enter on that button opened the drawer but left **focus behind on
  the button**, because the drawer was still `visibility: hidden` at the moment
  focus moved. The fix was in the CSS, not the script: transition visibility to
  visible instantly on open and only delay it on close;
- the feedback preview on Overview cut off mid-sentence, because it took the
  first *line* of the markdown rather than the first paragraph.

All three are in [`3275487`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/3275487) alongside the tests.

**I made the restart test restart something.** "State survives a reload" is easy
to fake by rendering the same page from the same process. `spec/session.ts`
boots its own copies of the built server against a chosen database path, so the
test saves a note, kills the server, starts a new one on the same file, and
asks again.

Docs and the live-count consumer for the SSE stream are
[`e816ec1`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/e816ec1); the whole run is
[`b79a860...e816ec1`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/compare/b79a860...e816ec1).

### How I knew it was right

`pnpm check` is 176 tests: the starter's accessibility and structure invariants
on every route, plus the invariants this prototype actually claims — the
outline equals the visible records by identifier, the sectionless resource is
collected, reordering changes order and not URLs, unpublished content and
unreleased marks are absent from lists, search, counts and their own addresses,
one visitor cannot read or write another's notes, and the save-note-edit-remove
flow survives a real restart.

Then the three demonstration journeys, driven in a browser: reaching
*Obfuscation terminology* from the outline and from the cross-link at the same
canonical URL; opening a mark and its full feedback from Overview in one click;
and saving a resource, writing a note, reloading, and returning to it through
Saved.

## Content provenance

The demonstration course reuses the content of my Assignment 2 site
(`comp4020-ass2-Ky787`) — its argument, week structure, terminology and
published findings — and none of its application code, layout or build
configuration. Every resource carries a `source` field naming where its text
came from, rendered at the foot of each resource page, so reused material and
newly written demonstration material are distinguishable on the page itself.
No experimental result was invented for this crit.
