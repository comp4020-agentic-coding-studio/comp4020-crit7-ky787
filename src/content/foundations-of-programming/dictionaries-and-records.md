---
title: Dictionaries and records
summary: When a list stops being the right shape, and what a dictionary gives you that an index cannot.
kind: page
section: w09
position: 10
source: Newly written demonstration material for this prototype
---

A list is the right shape when the things in it are *the same kind of thing* and
their **order** matters. A dictionary is the right shape when you need to look
something up **by name**.

```python
student = {"id": "u1234567", "name": "A. Visitor", "marks": [72, 68]}
```

Three things to notice:

- Keys are usually strings, and `student["name"]` is a lookup, not a position.
- The values do not all have to be the same type. `marks` is a list inside a
  dictionary, and that is normal.
- `student["email"]` on a missing key raises `KeyError`. Use
  `student.get("email")` when absence is expected, and let it raise when absence
  is a bug.

## Records versus tables

One dictionary is a **record**. A list of dictionaries is a **table**:

```python
enrolled = [
    {"id": "u1234567", "name": "A. Visitor"},
    {"id": "u7654321", "name": "B. Visitor"},
]
```

Almost every data exercise in the rest of this course is a loop over a table
that builds either a smaller table or a single accumulated value. Once you see
that shape, week 10 onwards is mostly recognising it.

## Exercise

Given a table of enrolments, write `by_id(rows)` that returns a dictionary
mapping each `id` to its whole record. Decide what should happen if two rows
share an id, and say so in a comment before you write the loop.
