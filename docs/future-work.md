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
  running them leaves real rows behind in the dev DB. This directly
  caused a real bug: an old test fixture ("Valid Program") saved
  before save-time pilotCode-definition validation existed got picked
  up by a live smoke test and made a real battle fail (correctly, now
  — see below). Save-time validation closes the immediate hole, but
  the underlying hygiene issue remains — worth a real fix (dedicated
  test DB, or wrapping each test in a rolled-back transaction) before
  this grows into noisier dev-data drift.
- The queued battle worker (`src/engine/worker.ts`) is triggered via
  Next's `after()`, which reliably keeps the function alive past the
  HTTP response in a real request — but it's still not a *durable*
  queue: a server restart mid-simulation loses that battle's progress
  (it stays stuck at `simulating` forever, same failure mode a crash
  produces). Fine for local dev; a real deployment should move this to
  something like Vercel Queues before matches are expected to survive
  restarts.
