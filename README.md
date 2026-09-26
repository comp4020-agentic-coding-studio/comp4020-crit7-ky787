# Course navigator

A student-facing replacement for the part of Canvas I use most and trust
least: finding the material for a course. It is a full-stack prototype — Astro
with a Node backend, Drizzle and SQLite on a Fly volume — carrying two
fictional demonstration courses, an anonymous demo session, and saved
resources with private notes.

**This is an unofficial student prototype. Every course, resource, deadline,
mark and piece of feedback in it is fictional. It is not connected to Canvas,
Wattle or any ANU system and holds no real academic records.**

## The problem it answers

My experience of Canvas is that navigation is fragmented. There is a global
menu, a course menu, flyouts, and a right-hand To Do and feedback column, and
finding one piece of material means checking several of them. Dashboard and
Courses overlap while behaving differently.

The worst of it is that the Modules list is not a dependable inventory of what
I can access. Some resources are only reachable by following a link inside
another page, so "it is not in Modules" does not mean "it is not there" — and
there is no way to tell the difference from the outside. Wattle's ordered
course structure did not have that problem. What Canvas does better is put
recent marks and feedback where I will see them.

So the argument this prototype makes is one sentence:

> **Students should have one dependable course outline, and useful marks and
> feedback should remain easy to see.**

The defining feature is therefore not the layout. It is that the outline is
**complete by construction**.

## What good looks like here

**One outline, derived, never maintained.** `src/lib/outline.ts` holds a pure
function, `buildOutline`, over content rows. The left navigation, the course
contents page, the resource count, the previous/next links and search all call
it. There is no second hand-written catalogue that can fall out of step with
the database, because there is no second catalogue at all.

**Filing cannot be forgotten.** A resource with no section — or one whose
section has been moved away — is collected automatically into *Other course
resources*. There is deliberately no database row for that group: it is derived
from the absence of a section, so it cannot be deleted or left empty by
mistake. The demonstration course includes a published reference page,
*Obfuscation terminology*, with no week at all. It is cross-linked from *Bogus
control flow*, and it is independently listed, countable and searchable. That
is the case Canvas loses, and it is the one this design is built around.

**One rule for "can the student see this".** `isVisible` is a single function.
The outline, search, the resource count and the direct URL all consult it, so
an unpublished resource is not merely hidden from a list — it has no page.
Released feedback works the same way: an unreleased mark is in the database and
reachable from nowhere.

**Assessment in one place.** Every brief is filed under an *Assessment* group
rather than in the teaching week it was set in, so finding what you are marked
on does not depend on remembering which week that was. It is an ordinary
section kind, ordered by the same rule as the rest of the outline.

**URLs that survive being reorganised.** A resource lives at
`/c/<course>/<slug>/`. Reordering changes a `position` column; it never touches
an address. A save, a bookmark and a cross-link all keep working.

**Saves are server state, not a convincing screen.** A visitor is a random id
the server generates and returns in an httpOnly cookie. Ownership is resolved
from that cookie in middleware, never from anything the client submits, so one
visitor cannot name another's session. Notes are written to SQLite on the
volume, validated before they are written, rendered as text rather than markup,
and survive a reload, a restart, a migration and a redeploy. `localStorage`
holds one thing only: which parts of the outline you collapsed.

**Controls that actually do something.** Expand all and Collapse all are links
the server honours, so they work without JavaScript, have their own URL, and
behave under Back and Forward. Save, note and remove are plain form posts, and
a rejected write says it was rejected instead of redirecting to a page that
looks like it worked.

### What I read while deciding

The [crit 7 brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/07-anu-system/)
and its spec; the starter's own documentation of what it fixes — `fly.toml`,
the `Dockerfile`, the CI workflow and `spec/README.md`; and my own Canvas
courses, as a user rather than as a researcher. The claims in this file about
Canvas are my reported experience of the courses I am enrolled in, not a claim
about every Canvas or Moodle installation.

### What is enforced, and what is judgement

Enforced by `spec/`:

- the outline lists exactly the visible content records, by identifier and not
  by count, with no duplicates — and the navigation agrees with it;
- the groups come in a fixed order — Course information, Assessment, the
  teaching weeks in order, then *Other course resources* last;
- every sectionless resource appears in *Other course resources*, and every
  assessment brief appears under *Assessment*, in the order it falls due;
- reordering changes order and nothing else, including URLs;
- an item whose section has moved away is not orphaned;
- unpublished resources and unreleased feedback are absent from the outline,
  from search, from the counts and from their own addresses;
- search never returns anything the contents page does not already list;
- the save, note, edit and remove flow survives reloads and a real restart of
  the server;
- one visitor cannot read or change another's notes, and the live stream never
  carries another visitor's activity;
- a note is rendered as text, an over-long one is refused, and a cross-site
  post is refused;
- plus the starter's accessibility floor on every route.

Judgement, and not enforced: whether the density is right, whether the outline
is legible at 31 resources, whether the reading typography is comfortable, and
whether one navigation column genuinely beats the arrangement it argues with.

## What I chose not to build

No messaging, no quiz engine, no assignment upload, no gradebook, no staff
administration, no real Canvas or Moodle integration and no chatbot. No login:
the demo session is anonymous and device-local by design, and the app says so
where it matters. No invented staff, policies or administrative filler. The
second course, *Foundations of Programming*, exists only to demonstrate course
switching and combined deadlines, and is deliberately small.

A complete small feature set beats an unfinished large one, and every control
in the interface does the thing it says.

## The demonstration content

The main course, *Seeing Through Obfuscated Code* (SLOP8445), reuses the
content of my Assignment 2 course site — its argument, its week structure, its
terminology and its findings — but none of its application code, layout or
build configuration. Each resource records where its text came from in a
`source` field, shown at the foot of every resource page, distinguishing reused
material from demonstration material newly written for this prototype. No
experimental result has been invented for this crit: the figures on those pages
are the ones that project already published.

The teaching term is fixed at Semester 2, 2026 so that the demonstration has
both marked work behind it and deadlines ahead of it. Those dates are literal
values in the seed and never move on startup, which is why the current
demonstration week is stated on each contents page as a derived, fictional
thing rather than implied to be the real ANU calendar. All times are displayed
in Australia/Sydney.

## Running it

```
pnpm install
pnpm dev      # http://localhost:4321
pnpm check    # typecheck, build, and the spec
```

The database is created at `.data/app.db` locally and at `/data/app.db` on the
deployed volume. Migrations and the idempotent seed both run at boot; neither
touches a visitor's saves or notes.
