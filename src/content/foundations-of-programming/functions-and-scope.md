---
title: Functions and scope
summary: Why a function is a name for a decision, what a parameter is, and where a variable can and cannot be seen.
kind: page
section: w08
position: 10
source: Newly written demonstration material for this prototype
---

A function is not mainly a way to avoid repeating yourself. It is a way to give
a decision a name, so the rest of the program can stop thinking about it.

```python
def is_overdue(due_day, today):
    return today > due_day
```

Now the rest of the program says `if is_overdue(d, t):` and nobody has to
remember whether the comparison was `>` or `>=`. The decision is made in one
place, and one place is where you go to change it.

## Parameters and arguments

A **parameter** is the name in the definition. An **argument** is the value you
pass in. They are different words because they are different things: the
parameter is local to the function, and assigning to it inside does not touch
whatever was passed in.

## Scope, in one rule

A name created inside a function is visible only inside that function, and
disappears when the function returns.

```python
def tally(items):
    count = 0        # local to tally
    for item in items:
        count += 1
    return count

print(count)         # NameError: count is not defined
```

That error is not the language being awkward. It is the language keeping the
promise that reading `tally` tells you everything `tally` does.

## Returning versus printing

`print` shows a value to a person. `return` hands a value back to the program.
A function that prints its answer and returns `None` cannot be used in a larger
expression, and this is the single most common structural mistake in week 8.
