---
title: Obfuscation terminology
summary: Course shorthand, with the qualification attached. Several of these definitions exist mainly to stop a word meaning two things in one sentence.
kind: reference
position: 10
source: Reused — definitions verbatim from comp4020-ass2-Ky787 (public/artefacts/TERMINOLOGY.md), rendered on that site at /glossary/
---

This page belongs to no teaching week. It is course-wide reference material,
and it sits in **Other course resources** because that is where an item with no
week belongs — not because a page happens to link to it.

Definitions are course shorthand; exact behaviour depends on the instruction
set, the IR and the analysis model.

**Read the second half of each definition.** Most of the trouble in this field
is not in the concepts but in the places where a term quietly changes scope — a
basic block that one tool splits at calls and another does not, an UNSAT that
holds under a path prefix and is then quoted as an invariant.

## Structure

**Basic block** — A sequence of instructions with one entry and no internal
control-flow branching; execution proceeds to its terminal transfer. *Tools may
split at calls differently, so report the convention.*

**CFG** — Control-flow graph: nodes represent blocks, directed edges represent
possible transfers. *A recovered CFG may be incomplete, especially at indirect
jumps.*

**LLVM IR** — LLVM's typed intermediate representation, between source-level
compilation and target code generation. Register values use SSA. *Memory effects
still require separate reasoning, and compiler-emitted and binary-lifted LLVM IR
have different provenance.*

**SSA** — Static single assignment: each register-like value has one definition;
merge points use mechanisms such as PHI nodes to select an incoming value.
*This exposes def/use relations without making memory inherently immutable.*

## Transformation

**Compiler optimization** — A transformation intended to preserve the
language- or IR-defined behaviour while improving cost or simplifying
representation. *Undefined behaviour and incorrect input IR undermine naive
equivalence claims.*

**Lowering** — Translating a representation into a more concrete one. *Lowering
is not necessarily optimization.*

**Canonicalization** — Replacing equivalent forms with a preferred or simpler
representation. *It can make obfuscated arithmetic recognizable without
recovering original source text.*

**Instruction substitution** — Replacing an operation with an equivalent
instruction or expression sequence, often selected from a set of templates.
*One static site can differ from another; later optimization may reverse the
expansion.*

**MBA** — Mixed Boolean-arithmetic: expressions combining bitwise operators and
arithmetic over fixed-width values. Bit width, overflow and extensions are part
of the semantics. *"Linear MBA" names a restricted algebraic class, not a
promise of easy native extraction.*

**Bogus control flow (BCF)** — Added control-flow structure intended to mislead
analysis, commonly involving cloned or irrelevant blocks guarded by opaque
conditions.

**Opaque predicate** — A predicate whose outcome is known or constrained to the
transformer under relevant program invariants but is intended to be difficult
for an analyst to establish. *A path-relative one-sided branch is not
automatically globally opaque.*

**Flattening** — Reorganizing structured control flow so execution of semantic
blocks is mediated by a dispatcher and encoded state rather than primarily by
the original direct edges.

**Dispatcher** — Code that selects the next semantic block from a state value.
*It can be a switch, comparison network, jump table or another mechanism; an
indirect jump is not required.*

**State variable** — A value encoding which block or state should execute next
in a flattened program. *It may live in memory, a register or several related
SSA values.*

**Virtualization** — In this course, translating protected behaviour into custom
bytecode interpreted by an embedded virtual machine. *It is distinct from
running Windows in a host VM. No virtualization or devirtualization experiment
was performed in this corpus.*

## Analysis

**Symbolic execution** — Executing instruction semantics over symbolic
expressions and constraints rather than only concrete values. *State and memory
models bound its claims.*

**Dynamic symbolic execution** — Symbolic reasoning associated with an observed,
emulated or otherwise concretely guided execution. *"Dynamic" does not require
running the entire original process natively.*

**Concolic execution** — Combined concrete and symbolic execution. *Often used
interchangeably with DSE in practice; state which mechanism the workflow
actually uses.*

**SMT** — Satisfiability modulo theories: deciding whether a logical formula has
a model under theories such as fixed-width bit-vectors or arrays. *The theory
must match the computation being claimed.*

**SAT** — The submitted formula has a satisfying model. *For an
equivalence-disequality query, that model is a counterexample within the model,
not automatically a reachable whole-program input.*

**UNSAT** — No assignment satisfies the submitted formula under its assumptions.
*For a faithful disequality model this establishes equivalence within scope;
inconsistent assumptions can make a proof vacuous.*

**UNKNOWN / timeout** — The solver did not establish SAT or UNSAT. *It is
neither an equivalence proof nor a demonstrated counterexample.*

## Outcome

**Lifting** — Translating native instructions into an intermediate semantic
representation for analysis or recompilation. *Well-formed output is not proof
that the translation is faithful.*

**Binary rewriting** — Modifying an executable's machine code and, where needed,
its metadata or layout. *Proof generation, patch application and runtime
validation are separate concerns.*

**Semantic equivalence** — Equality of the relevant observable behaviour for
specified inputs, states and environment. *Equality of a return expression is
narrower than whole-program equivalence including memory, faults and external
effects.*

**Deobfuscation** — Recovering a more useful representation or behaviour from
obfuscated code. *Outputs may be expressions, a CFG, IR or a rewritten
executable; always identify which.*

## On width

For this corpus, many arithmetic claims concern `uint32` values modulo 2³². Do
not replace them with unbounded integer identities without checking the
translation.
