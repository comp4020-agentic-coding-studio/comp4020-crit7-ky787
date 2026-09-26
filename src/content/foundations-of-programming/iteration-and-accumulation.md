---
title: Iteration and accumulation
summary: Loops that build a result, the accumulator pattern, and the two off-by-one errors that account for most of them.
kind: page
section: w07
position: 10
source: Newly written demonstration material for this prototype
---

Most loops you will write do one of two things: they **visit** every item, or
they **accumulate** a result across every item.

```python
total = 0
for price in prices:
    total = total + price
```

Three things are happening, and beginners routinely merge them:

1. `total = 0` — the accumulator starts at a value that is correct for an empty
   list. For a sum that is `0`; for a product it is `1`; for "the largest so
   far" there is no safe starting value and you have to handle the empty case.
2. `for price in prices` — one pass, one item at a time.
3. `total = total + price` — the update. Read the right-hand side first: it uses
   the *old* total.

## The two off-by-one errors

**Starting inside the loop.** Putting `total = 0` inside the `for` resets it
every time, so you finish with only the last item. The program runs and the
answer is wrong, which is the worst combination.

**Using `range(len(...))` when you wanted the items.** `range(len(prices))`
gives you `0, 1, 2`, not the prices. If you want the items, loop over the list.
If you genuinely need positions as well, use `enumerate`.

## Exercise

Write `longest_word(words)` returning the longest string in a list. Decide what
it should do for an empty list *before* you write it, and write that decision as
a comment. Then make the code match the comment.
