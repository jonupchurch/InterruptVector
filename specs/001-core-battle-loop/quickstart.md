# Quickstart: Validating the Core Battle Loop

A runnable path to prove the feature works end-to-end, once
implemented. Not implementation code — see `tasks.md` (Phase 2) for
that.

## Prerequisites

- `.env.local` populated (already scaffolded — `DATABASE_URL` pointing
  at a local Postgres instance).
- `npm install`
- `npm run db:migrate` — applies the schema from data-model.md,
  including seeding the 40 boss/practice-challenger rows.

## Run

```sh
npm run dev
```

## Manual validation scenario (mirrors spec.md's User Stories 1-4)

1. Open the Tank Builder ("The Bay"). Confirm only tier-1 parts are
   selectable (fresh Pilot Profile, rank 1). Assemble a build, save it.
2. Reopen the builder — confirm the same build reloads with identical
   parts and derived stats (User Story 1, Acceptance Scenario 3).
3. Open the Coding page ("The Socket"). Write a minimal pilot program
   (e.g., always `fire()` if a bogey is in range from `sensors()`,
   otherwise `moveForward()`). Save it under a name.
4. Open the Battle Browser ("Battles"). Confirm the rank-1 boss and its
   3 practice challengers are all listed and selectable.
5. Submit the saved build + program against the rank-1 boss. Confirm
   the battle appears with `status: queued`, then transitions to
   `complete` with a win/loss outcome once simulation finishes.
6. If the result is a win: confirm the Pilot Profile's rank advances to
   2, and tier-2 Chassis/Weapon (and, if rank 2 is a Sensors/Mobility/
   Power unlock rank, those too) become selectable back in the builder.
7. Open the Replay Viewer for the just-completed battle. Confirm
   play/pause/scrub works across the full tick range, and that any
   `log()` calls from the pilot program appear at their correct tick.
8. Open the Battles page's history tab. Confirm the just-completed
   battle is listed and its replay is reachable from there.

## Automated verification

```sh
npm run typecheck
npm run lint
npm test              # unit + integration (tests/unit, tests/integration)
npm run test:e2e      # Playwright: the scenario above, scripted
```

Two test categories are non-negotiable per Principle V and must exist
as their own suites (not folded into generic unit tests):

- `tests/adversarial/` — sandbox-escape attempts (infinite loop,
  memory exhaustion, forbidden API access) MUST be contained or killed
  without affecting match integrity or server stability.
- `tests/determinism/` — the same stored build + program + seed MUST
  produce a byte-identical tick log across repeated simulation runs.

## Success criteria mapping

Each `SC-00N` in spec.md should be checkable via the steps above or
the automated suites — e.g. SC-001 via the manual scenario end-to-end,
SC-002 via `tests/determinism/`, SC-004 via `tests/adversarial/`.
