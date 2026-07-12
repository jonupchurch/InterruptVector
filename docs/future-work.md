# Future Work

Ideas and scope explicitly deferred past the current MVP (constitution
Principle IV). Nothing here is scheduled — this is a parking lot, not a
roadmap.

## Deferred by the constitution (Principle IV)

- Async, challenge-based PvP base raiding, with a non-spendable Renown
  score/leaderboard (see wiki: Progression, "Future: PvP raiding").
- Matchmaking, ranking/rating, rank bands.
- Multi-user accounts/auth (v1 is single-owner, no login).
- Live spectating of an in-progress match.
- Tournaments, brackets, or scheduled events.
- Clans/teams, chat, or any social feature.
- Multiple simultaneous arenas/maps, or allied/multi-vehicle play (a
  reserved but undesigned `api` placeholder for ally commands exists
  in the Pilot Code contract).
- More than one supported pilot-code language/runtime.
- Cosmetics or monetization of any kind.

## Noted during design, not yet real scope

- Exact per-boss behavior/difficulty calibration for ranks 2-10 (see
  `specs/001-core-battle-loop/tasks.md`, T070) — content-authoring
  work, sequenced after the rank-1 vertical slice is proven.
- Whether replay-log storage should move from Postgres JSONB to object
  storage (Vercel Blob) — deferred until match volume is a measured
  concern, not a hypothetical one (see `docs/adr/0003-replay-storage-shape.md`).

## Noted during implementation

- Integration tests currently hit the real local Postgres instance
  directly (no separate test database, no transaction rollback), so
  running them leaves real rows behind in the dev DB (observed while
  smoke-testing the Coding page — an integration-test-created "Valid
  Program" row was already selected by default on page load). Not
  breaking anything today, but worth a real fix (dedicated test DB, or
  wrapping each test in a rolled-back transaction) before this grows
  into noisier dev-data drift.
