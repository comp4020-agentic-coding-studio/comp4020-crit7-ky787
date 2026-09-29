# Process overview

## What I built

Course navigator: a replacement for course navigation in Canvas, built using Astro with a Node backend, Drizzle and SQLite on a Fly volume. I have always found the canvas UI design to be very confusing and unintuitive which is what this crit tries to address. Additionally, my previous Obfuscation course was used as example content as I already knew it's internals. 

## How I got here

### Making important course info easy to see

I used ChatGPT to generate an initial prompt for Claude which resulted in a website that had all important course information on the left sidebar similar to how Wattle used to be. After generating the initial website I had claude put emphasis on parts of a course info website that I find important as a student such as making Assessment infomation and all course pages acessible on the left sidebar. 

- [`98bf818`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/98bf818) - merged the project rules into the starter's
  `CLAUDE.md` rather than overwriting it, so the one instruction it shipped
  with (read the brief and spec first) survives as its own section.
- [`bafef98`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/bafef98) - the end-to-end slice: schema, idempotent
  seed, `buildOutline`, resource pages, anonymous sessions, saves and notes.
  This is the commit where the left sidebar stopped being a hand-written list
  and became a projection of the content records.
- [`3275487`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/3275487) - the spec tests, plus three defects only a
  real browser found: the mobile menu button pushed off the screen edge,
  keyboard focus left behind when the drawer opened, and a feedback preview
  cut off mid-line.
- [`e816ec1`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/e816ec1) - `README.md`, and the live save-count over
  the starter's server-sent-events stream.

### Added some elements of Canvas that are actually good

Some parts of canvas such as the "To-Do" and "Recent Feedback" are good because they present the user with useful information easliy, this was kept in the new design while fixing issues of the old by displaying all pages in the left sidebar. Additionally, I prompted claude to use more whitespace to fill out the page more which is another element canvas gets right.

- [`3ad84d1`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-ky787/commit/3ad84d1) - the **Assessment** group, so every brief
  sits in one place instead of in the teaching week it was set in; and the
  footer moved into the content column, which had been slicing the navigation
  in half at the bottom of a long course.



