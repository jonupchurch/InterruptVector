# ADR 0002: Persistence via PostgreSQL + Drizzle

**Status**: Accepted
**Date**: 2026-07-11
**Related**: constitution Technology Constraints

## Context

The project needs durable, relational persistence from day one: pilot
profile/rank, tank builds, saved pilot-code programs, boss/practice-
challenger definitions, and battle records. This was already scaffolded
early in the project (`src/db/index.ts`, `src/db/schema.ts`,
`drizzle.config.ts`) but the constitution's Technology Constraints
section marked it "ADR owed" — this document is that record.

## Decision

PostgreSQL, queried through Drizzle ORM (the `drizzle-orm` +
`postgres` packages already in `package.json`).

## Rationale

- **Pattern validated on prior projects**: this is a carried-over,
  previously-proven combination for a solo-maintained TypeScript app,
  not a novel choice being evaluated from scratch.
- **Relational fit**: the core entities (Pilot Profile, Tank Build,
  Pilot Code Program, Boss/Challenger, Battle) have real relationships
  to each other (a Battle references a Build and a Program; a Build
  references part-catalog tiers) that a relational schema expresses
  directly.
- **Type-safe query layer**: Drizzle's TypeScript-first schema and
  query builder keeps the schema and the application code in sync
  without a separate codegen step, fitting the project's
  TypeScript-strict constraint.

## Alternatives Rejected

No live alternative evaluation was conducted for this feature — the
choice predates this plan (already scaffolded) and is being formally
recorded here per Principle I rather than re-litigated. A genuinely
different persistence layer would be its own future ADR if a concrete
problem with this one ever surfaces.

## Consequences

- Replay tick-logs, despite being append-only and non-relational in
  shape, are also kept in Postgres (as JSONB) rather than a separate
  store — see [ADR 0003](./0003-replay-storage-shape.md) — to avoid a
  second storage integration for v1.
- Schema migrations go through `drizzle-kit generate`/`migrate`
  (already wired up in `package.json`).
