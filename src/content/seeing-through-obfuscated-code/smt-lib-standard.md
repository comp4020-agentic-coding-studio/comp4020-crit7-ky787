---
title: "External: The SMT-LIB standard"
summary: The definition of the fixed-width bit-vector theory the week 7 and 8 queries are written in.
kind: external
externalUrl: https://smtlib.cs.uiowa.edu/
position: 50
source: Newly added demonstration link — an external resource recorded in the outline rather than buried inside a week page
---

The SMT-LIB standard defines the language the retained solver queries in weeks 7
and 8 are written in, and the theory those queries are interpreted under.

For this course, the relevant part is the fixed-width bit-vector theory
(`QF_BV`): `bvand`, `bvsub`, `bvmul`, and the comparison operators, all over
values that wrap. That wrapping is the difference between an identity over the
integers and an identity on the machine, which is the point week 6 ends on and
week 7 resolves.

The course records the resource, not its contents.
