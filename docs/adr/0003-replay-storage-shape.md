# ADR 0003: Replay tick-log storage shape

**Status**: Accepted
**Date**: 2026-07-11
**Related**: [specs/001-core-battle-loop/research.md](../../specs/001-core-battle-loop/research.md), [ADR 0002](./0002-persistence-postgres-drizzle.md)

## Context

Every simulated battle produces a full tick-by-tick record (tank
state, every `api` call and its result, damage events, `log()`
messages — spec FR-023) that the Replay Viewer reads back. The
constitution's Technology Constraints section flagged this as "likely
large, append-only, and rarely queried relationally — candidate for
object storage (e.g. Vercel Blob) rather than DB rows; ADR owed."

## Decision

Store each battle's full tick-log as a single JSONB payload in
Postgres (a dedicated table/column via Drizzle), not in separate
object storage, for v1.

## Rationale

- A single match is capped at ~3,000 ticks (spec FR-018) for two
  tanks, each tick producing a handful of discrete events — bounded,
  not "large" in any way that stresses Postgres's JSONB storage at
  hobby-project scale. The constitution's original "likely large"
  framing predates having a concrete tick cap and event shape.
- Keeping the log alongside its owning Battle row avoids a
  cross-store consistency problem (a Battle existing without its log,
  or vice versa) that a second storage system would introduce.
- One fewer infrastructure integration for v1, in keeping with
  Principle IV's scope discipline — object storage adds real
  operational surface (a second service, its own access patterns) for
  a problem that doesn't exist yet at this scale.

## Alternatives Rejected

- **Vercel Blob** (or other object storage) — not rejected
  permanently, deferred: revisit if per-match log size or total
  replay-storage volume becomes a measured operational concern (e.g.
  once PvP/Renown materially increases match volume), not a
  hypothetical one. Because the log is one coherent JSON document
  either way, moving it from a JSONB column to blob storage later is a
  storage-layer change, not a data-model change — this decision isn't
  a lock-in.

## Consequences

- Replay reads are a normal Postgres query, no separate fetch/CDN path
  to reason about for v1.
- If match volume later requires migrating to object storage, the
  Battle row keeps a reference (URL/key) in place of the inline JSONB
  payload — a schema change, but not a reshaping of the log's own
  structure.
