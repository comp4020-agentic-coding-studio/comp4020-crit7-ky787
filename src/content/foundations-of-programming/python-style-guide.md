---
title: Course Python style guide
summary: The naming, layout and comment conventions every submission in this course is expected to follow.
kind: reference
position: 10
source: Newly written demonstration material for this prototype — deliberately has no week, so it demonstrates the fallback section in the second course too
---

Reference material. It belongs to no week, so it lives in **Other course
resources**.

## Names

- `lower_snake_case` for variables and functions.
- Names say what the value *is*, not what type it is: `prices`, not
  `price_list`.
- A single letter is fine for a loop index in a three-line loop and nowhere
  else.

## Layout

- Four spaces per indent level. Never tabs.
- One blank line between functions; two at the top level of a file.
- Lines under 88 characters. If a line does not fit, the expression is usually
  doing too much.

## Comments

Comment the **decision**, not the mechanism.

```python
# Wrong: increments the counter
count += 1

# Right: an empty record still counts as a submission
count += 1
```

If a comment restates the code, delete one of them — and it is usually the
comment.

## Before you submit

1. Run the program on the supplied input and check the output matches.
2. Run it on an empty input and check it does something sensible.
3. Read your own diff. Anything you cannot explain does not go in.
