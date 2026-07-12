# Status

**Phase**: Core Battle Loop feature implemented (76/76 tasks), all
green locally. Not yet deployed.
**Last updated**: 2026-07-11

## Where things stand

- Constitution v0.2.0-draft — still formally unratified
  (`RATIFICATION_DATE` is still `TODO`), but has been revised to match
  everything actually decided and built (full ten-rank ladder as core
  v1 scope, sandbox tech resolved to WASM, test-discipline language
  matching reaffirmed process expectations).
- `specs/001-core-battle-loop/` is fully spec'd, planned, and
  implemented: all 4 user stories (build → code → fight → replay), all
  76 tasks checked off in `tasks.md` (with notes on every real
  deviation from the original plan).
- The whole loop works end-to-end, verified with real Playwright runs
  against the live dev server (not just unit tests): build a tank,
  save pilot code, submit a battle, watch it resolve through the
  actual WASM sandbox and tick-simulation engine, open the replay,
  scrub it.
- All 40 ladder opponents (10 bosses + 30 practice challengers) are
  authored, seeded, and validated (syntax + `pilotCode(api)`
  definition checked for every one, not assumed correct).
- Test suite: 125 Vitest tests (unit/integration/adversarial/
  determinism) + 6 Playwright e2e tests (full vertical slice,
  automated axe accessibility scans, mobile-viewport overflow checks).
  `typecheck`/`lint`/`test`/`build` all green.
- Four ADRs written (`docs/adr/`): sandbox tech, persistence, replay
  storage shape, and the pilot-code action-queue model.
- Nothing is deployed yet — this has all been run and verified against
  local Postgres and `npm run dev` only. Vercel setup is explicitly the
  next step, and explicitly the project owner's own action, not done
  as part of this work.

## Known gaps / accepted limitations (see `docs/future-work.md` for the full list)

- The queued battle worker (`src/engine/worker.ts`, triggered via
  Next's `after()`) is not a durable queue — a server restart
  mid-simulation leaves that battle stuck, same as an unhandled crash
  would. Fine for local dev; needs a real queue (e.g. Vercel Queues)
  before this matters in production.
- Integration tests hit the real local Postgres instance directly, no
  test-database isolation or transaction rollback — real rows
  accumulate in the dev DB from running the suite.
- No auth/multi-user yet (single implicit Pilot Profile row) — stated
  v1 scope, not an oversight.

## Next up

- User review of the constitution's v0.2.0-draft revisions and formal
  ratification.
- Vercel deployment setup (project owner's own action).
- Whatever comes after the Core Battle Loop is validated live — likely
  starting with the PvP/Renown direction sketched in the wiki, or
  hardening the items in "Known gaps" above.

## Blockers

- None.
