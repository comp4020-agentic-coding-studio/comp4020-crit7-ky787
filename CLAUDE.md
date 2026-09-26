# Crit 7: Canvas navigation redesign

<!-- Merged harness: the starter's CLAUDE.md arrived empty by design, with one
     instruction in it — read the brief and the spec on the course website
     before planning or building, and decide for yourself what the agent must
     carry from them. That instruction is kept below as "Brief and spec", and
     everything after it is the accumulated project guidance. Nothing about the
     starter's plumbing is restated here: `fly.toml`, the `Dockerfile`, the CI
     workflow and `spec/README.md` each document what they fix. -->

## Brief and spec

The [course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name says which
deliverable applies: **crit 7**. Read both before planning or building. The
brief poses the problem; the spec is the fixed contract. These project rules
sit on top of the spec and never replace it.

## Purpose
Build a focused student-facing alternative to the fragmented navigation the
student experiences in Canvas. Restore the ordered, discoverable course
structure they valued in Wattle, while retaining visible recent marks and
feedback. This is an unofficial prototype with fictional course data, not a
complete LMS or a live ANU integration.

## Repository and course instructions
- Work in the existing repository:
  /home/ky/Documents/ANU/2026 Semester 2/COMP8020 - Agentic Coding Studio/comp4020-crit7-ky787
- Quote paths in shell commands. Never create a replacement repository.
- Merge these project rules with the starter's existing CLAUDE.md; do not
  discard course instructions or the student's accumulated guidance.
- Read any existing AGENTS.md, README, package scripts, checks and deployment
  configuration before changing the implementation.
- The published course brief and spec determine submission requirements.
  These project decisions do not replace the course spec.
- Preserve the current scaffold and its required checks/endpoints. Prefer its
  Astro, Drizzle and SQLite setup rather than importing an earlier static app.
- Keep code and configuration changes inside this repository. Prior coursework
  may be inspected read-only for the explicitly requested content reuse.

## Product invariants
- Every content item currently visible to the demo student must appear exactly
  once in the primary course outline.
- Derive the outline, full contents view and search from the same content records
  and visibility rules. Never maintain a separate hand-written navigation list.
- A published resource without a section belongs automatically in Other course
  resources. It must never depend on a link inside another page to be found.
- Give resources stable URLs. Cross-links point to those canonical resources.
- Apply visibility rules to navigation, search and direct URL access.
- Use one coherent navigation area, not competing global/course/right sidebars.
- Keep navigation links distinct from expand/collapse controls.
- Keep recent marks and released feedback directly accessible from Overview.
- Search supplements browsing; it does not excuse an incomplete outline.

## Content and presentation
- Seeing Through Obfuscation is the main fictional demonstration course.
- Reuse its existing content where available without altering the old project
  or importing its application layout, build configuration or process history.
- Record source locations and distinguish reused content from newly written
  demo material. Never invent experimental results or real academic records.
- Use a smaller second fictional course to demonstrate switching and aggregation.
- Label courses, assessment dates, marks and feedback as demonstration data.
- No invented staff profiles, university policies or administrative filler.
- Use restrained styling, readable typography and useful content density.
- No emojis, decorative dashboard clutter, gamification or unrequested AI tools.

## Behaviour and data
- Saves and personal notes use real server-side database persistence.
- Keep each anonymous demo visitor's personal state separate. Derive ownership
  from the server session, never from a client-supplied user identifier.
- Validate writes, render notes safely, and show useful failure and empty states.
- Seed data idempotently. Never erase personal data during normal startup,
  migration, deployment or reseeding.
- Keep the deployed SQLite database on the scaffold's durable storage.
- Do not commit database files, credentials, private course records or large
  binaries. Do not request real ANU credentials.
- Support keyboard use, narrow screens, native links and browser Back/Forward.

## Working practices
- Build a small end-to-end slice first, then extend it. Avoid unnecessary
  dependencies, framework changes and rebuilding unrelated previous projects.
- Make meaningful incremental commits. Never fabricate history, force-push,
  discard unrelated work or change Git identity without permission.
- Run the repository's checks plus focused tests for the product invariants.
  Never weaken the course checks to manufacture a pass.
- Inspect rendered desktop and mobile layouts using available browser tooling.
  Report checks that could not be performed; do not claim unobserved success.
- Keep PROCESS.md grounded in actual decisions, corrections and real commits.
- Use reflections/crit-7.md for this crit. Do not invent the student's learning,
  feedback, testing participants or personal experience. Flag any writing that
  still needs their input rather than declaring the submission complete.

## Deployment boundary
- Follow the installed course preflight/ship workflow and existing CI.
- Do not substitute GitHub Pages for this full-stack deployment.
- Do not run flyctl deploy manually or request the course deployment token.
- Before making a private repository public, complete the course checks and
  secret scan, then obtain the explicit confirmation required by ship.
- Respect existing permissions and report authentication/provisioning blockers.
- After authorised deployment, verify the actual live URL and core interaction.
  Distinguish local success, CI success and verified deployed success.
