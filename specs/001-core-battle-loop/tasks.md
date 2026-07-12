---

description: "Task list for Core Battle Loop (Build → Code → Fight → Replay)"

---

# Tasks: Core Battle Loop (Build → Code → Fight → Replay)

**Input**: Design documents from `specs/001-core-battle-loop/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md — all present

**Tests**: Included as first-class tasks, not optional — Principle V is non-negotiable on unit/integration/adversarial/determinism coverage, and the project owner has separately reaffirmed unit/integration/e2e as the expected default.

**Organization**: Tasks are grouped by user story (spec.md priorities) to enable independent implementation and testing of each story.

## Path Conventions

Single project (per plan.md's Structure Decision): `src/app`, `src/engine`, `src/db`, `src/lib`, `src/components` for source; `tests/unit`, `tests/integration`, `tests/adversarial`, `tests/determinism` for Vitest; `e2e/` for Playwright (already scaffolded).

---

## Phase 1: Setup

**Purpose**: Add what this feature needs on top of the already-scaffolded Next.js/TypeScript/Tailwind/Zod/Drizzle/Vitest/Playwright project.

- [X] T001 Add `quickjs-emscripten` and `@monaco-editor/react` to `package.json`, run `npm install`
- [X] T002 [P] Create `src/engine/`, `src/engine/sandbox/`, `src/engine/opponents/` directory structure per plan.md
- [X] T003 [P] Create `docs/future-work.md` (constitution requires out-of-scope ideas logged here, not left implicit)
- [X] T004 [P] Add `tests/integration/`, `tests/adversarial/`, `tests/determinism/` directories (unit tests are colocated next to their source files, e.g. `src/lib/unlocks.test.ts`, matching the convention already established by `src/env.test.ts` — no `tests/unit/` directory; Vitest's default `include` already discovers both patterns, no config change needed)
- [X] T005 Verify local Postgres connection and existing Drizzle config (`drizzle.config.ts`, `src/db/index.ts`) still resolve before schema work begins

**Checkpoint**: Dependencies and directory structure in place.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure every user story needs — parts catalog, schema, unlock rules, page shell. No user story work starts before this is done.

**⚠️ CRITICAL**: Blocks all user stories below.

- [X] T006 Transcribe the fixed parts catalog (Chassis 10 tiers, Weapon 10 tiers, Sensors/Mobility/Power 5 tiers each, from the wiki's 1.1.1-1.1.5 pages) into `src/lib/parts-catalog.ts`
- [X] T007 [P] Implement unlock-rule helpers (Chassis/Weapon tier ≤ rank; Sensors/Mobility/Power tier ≤ ceil(rank/2)) in `src/lib/unlocks.ts` (tests: `src/lib/unlocks.test.ts`)
- [X] T008 [P] Implement weight-capacity validation (Mobility + Power + Weapon weight ≤ Chassis Weight Capacity, spec FR-003) in `src/lib/weight-validation.ts` (tests: `src/lib/weight-validation.test.ts`)
- [X] T009 Define Drizzle schema for all 6 entities (Pilot Profile, Tank Build, Pilot Code Program, Boss/Practice Challenger, Battle, Battle Log) in `src/db/schema.ts` per data-model.md
- [X] T010 Generate and run the initial migration (`npm run db:generate`, `npm run db:migrate`) — also fixed `drizzle.config.ts` to load `.env.local` explicitly (drizzle-kit runs standalone, outside Next.js's automatic env loading)
- [X] T011 Seed the single implicit Pilot Profile row (rank 1) per spec Assumptions — `scripts/seed.ts`, idempotent, `npm run db:seed`
- [X] T012 [P] Implement shared design-system tokens/theme (colors, type, spacing) in `src/app/globals.css` per the Design System wireframe and Principle III (hex values transcribed directly from `resources/Design System.html` and the bundled page wireframes)
- [X] T013 [P] Implement the shared page shell/navigation across the six MVP pages in `src/app/layout.tsx` and `src/components/Nav.tsx`

**Checkpoint**: Foundation ready — user stories can now proceed.

---

## Phase 3: User Story 1 - Build a tank (Priority: P1) 🎯 MVP

**Goal**: A player assembles a tank from unlocked parts and saves it as a named build.

**Independent Test**: Assemble a build from unlocked parts, save it, confirm it reloads with identical parts/derived stats (spec Acceptance Scenario 3).

### Tests for User Story 1

- [X] T014 [P] [US1] Integration test: `POST /api/builds` rejects a build exceeding Chassis Weight Capacity in `tests/integration/builds.test.ts`
- [X] T015 [P] [US1] Integration test: `POST /api/builds` rejects a part tier above the profile's current unlock level in `tests/integration/builds.test.ts`
- [X] T016 [P] [US1] Unit tests for `src/lib/unlocks.ts` and `src/lib/weight-validation.ts` — done as part of T007/T008 (colocated `src/lib/unlocks.test.ts`, `src/lib/weight-validation.test.ts`), plus `src/lib/derived-stats.test.ts` for the Speed/Total Weight display

### Implementation for User Story 1

- [X] T017 [US1] Implement `GET`/`POST /api/builds` route handlers in `src/app/api/builds/route.ts`
- [X] T018 [US1] Implement `PATCH /api/builds/:id` route handler in `src/app/api/builds/[id]/route.ts`
- [X] T019 [US1] Build the Tank Builder page (`src/app/builder/page.tsx`) per The Bay wireframe, restricted to unlocked tiers
- [X] T020 [US1] Build per-system part-picker components (showing derived stats, e.g. Speed, Total Weight) in `src/components/builder/`
- [X] T021 [US1] Wire the save/reload flow end-to-end on the Tank Builder page — verified with a Playwright smoke check (page loads, save succeeds, no console errors) in addition to the automated tests above

**Checkpoint**: User Story 1 fully functional and independently testable.

---

## Phase 4: User Story 2 - Write and save pilot code (Priority: P1)

**Goal**: A player writes JavaScript against the documented `api` and saves it as a named, reusable program.

**Independent Test**: Write a program, save it, close and reopen it with contents intact (spec Acceptance Scenario 2/3).

### Tests for User Story 2

- [X] T022 [P] [US2] Integration test: `POST /api/programs` surfaces a syntax error without discarding the client's unsaved text in `tests/integration/programs.test.ts`

### Implementation for User Story 2

- [X] T023 [US2] Implement `GET`/`POST /api/programs` and `PATCH /api/programs/:id` route handlers in `src/app/api/programs/route.ts` and `src/app/api/programs/[id]/route.ts`
- [X] T024 [US2] Integrate Monaco editor in `src/app/code/page.tsx` per The Socket wireframe
- [X] T025 [US2] Build the saved-program list/select UI — inline within `src/components/code/CodeEditorPage.tsx` rather than a separate `ProgramList.tsx` (tight coupling with editor/selection state made one component simpler; not a separate file as originally sketched)
- [X] T026 [US2] Implement client-side and server-side JS syntax validation before save — server-side via `src/lib/syntax-check.ts` (parses via `new Function`, never executes); client never clears unsaved text on a save error
- [X] T027 [US2] Wire the save/reload flow end-to-end on the Coding page — verified with a Playwright smoke check against Monaco specifically (editor mounts, save succeeds, zero console errors)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - Fight a boss or practice challenger (Priority: P1)

**Goal**: A player pairs a build with a program, fights their rank's boss or an unlocked practice challenger, and gets a deterministic win/loss result.

**Independent Test**: Submit a build+program against a boss, confirm a deterministic result is returned and rank advances on a win (spec Acceptance Scenarios 1-6).

### Sandbox & engine core

- [X] T028 [US3] Implement the WASM interpreter wrapper (instantiate/teardown `quickjs-emscripten`) in `src/engine/sandbox/interpreter.ts` — uses `newQuickJSWASMModule()` (a fully isolated module per sandbox) rather than the shared `getQuickJS()` singleton, so one crashed/interrupted sandbox can't corrupt another's WASM state (Principle II)
- [X] T029 [US3] Implement `api` host-function bindings (`self`, `canMove`, `moveCost`, `sensors`, `rotateTank`, `rotateTurret`, `rotateTurretToXY`, `moveForward`, `moveBackward`, `fire`, `log`) per `contracts/pilot-code-api.md` in `src/engine/sandbox/api-bindings.ts`
- [X] T030 [US3] Implement the step-count execution budget and interrupt handling (spec FR-012) in `src/engine/sandbox/step-budget.ts`
- [X] T031 [US3] Implement the WASM memory ceiling and its three-consecutive-violations forfeit handling (spec FR-013) in `src/engine/sandbox/memory-guard.ts`
- [X] T032 [US3] Implement the per-system action queue (movement/turret/fire/sensors tracked independently, non-blocking, spec FR-011) in `src/engine/queue.ts` — tracks the in-flight action itself (not just a countdown) so its effect can be applied when it *completes*, not when requested; queue depth capped at 1
- [X] T033 [US3] Implement grid/footprint/facing resolution (8-direction quantization, fixed 45°/5-tick turret rate, `rotateTurretToXY` free-remainder rule, spec FR-020) in `src/engine/grid.ts`
- [X] T034 [US3] Implement terrain generation (7 types, mirrored across the LL/UR diagonal, spec FR-021/FR-022) in `src/engine/terrain.ts` — deterministic via `src/engine/rng.ts` (seeded mulberry32, since `Math.random()` can't satisfy Principle V)
- [X] T035 [US3] Implement the damage formula (`max(1, Base − max(0, Armor − AP))`, Gauss Cannon armor-ignore exception, spec FR-019) in `src/engine/damage.ts`
- [X] T036 [US3] Implement Power Reserves/Output/overload resolution, including `sensors()`'s 1-Reserves cost and error return (spec FR-015) in `src/engine/power.ts`
- [X] T037 [US3] Implement the deterministic tick loop (`pilotCode(api)` once per tick per tank; applies queued actions; resolves movement/damage/power) in `src/engine/simulate.ts`
- [X] T038 [US3] Implement the match tick-cap/timeout rule (3,000-tick default, loss on timeout regardless of relative HP, spec FR-018) in `src/engine/simulate.ts`
- [X] T039 [US3] Implement tick-by-tick replay-log recording (state, `api` calls, damage events, `log()` messages tagged `pilot`/`system`, spec FR-023) in `src/engine/replay-log.ts` — damage is visible via hp deltas between tick snapshots rather than a separate discrete damage-event list; a documented simplification, not a spec violation
- [X] T040 [US3] Implement uncaught pilot-code exception handling (partial-tick effects stand, error surfaces on the log channel, spec Edge Cases) in `src/engine/sandbox/error-handling.ts`

### Battle queue & progression

- [X] T041 [US3] Implement `POST /api/battles` (snapshots build+program per data-model.md, enqueues, returns `queued` status) in `src/app/api/battles/route.ts`
- [X] T042 [US3] Implement the queued/background simulation worker that picks up `queued` Battles and runs `src/engine/simulate.ts` in `src/engine/worker.ts` — triggered via `src/lib/schedule-after-response.ts` (wraps Next's `after()`, the documented way to keep a function alive past the response; falls back to a plain async call outside a request scope so route handlers stay directly testable). Any unexpected error marks the battle `failed` (new status + `errorMessage` column) instead of leaving it stuck at `simulating` forever — a real bug caught via a Playwright smoke test against a bad program fixture, not something the plan anticipated
- [X] T043 [US3] Implement `GET /api/battles/:id` status/outcome polling in `src/app/api/battles/[id]/route.ts`
- [X] T044 [US3] Implement rank-advancement on a boss win, without re-granting on a repeat win (spec FR-024, FR-028) in `src/engine/progression.ts`

### Opponent content (rank 1 only — see Complexity Tracking in plan.md for why the rest is sequenced later)

- [X] T045 [US3] Author the rank-1 boss's loadout and pilot code in `src/engine/opponents/rank-1-boss.ts` ("The Watchman")
- [X] T046 [P] [US3] Author rank-1 practice challenger 1 in `src/engine/opponents/rank-1-challenger-1.ts` ("The Drone")
- [X] T047 [P] [US3] Author rank-1 practice challenger 2 in `src/engine/opponents/rank-1-challenger-2.ts` ("The Sentry")
- [X] T048 [P] [US3] Author rank-1 practice challenger 3 in `src/engine/opponents/rank-1-challenger-3.ts` ("The Rammer")
- [X] T049 [US3] Seed the 4 rank-1 opponents into the Boss/Practice Challenger table — `scripts/seed.ts`; gear is tier 2 Chassis/Weapon + tier 1 Sensor/Mobility/Power (`unlockedTiersForRank(2)`), matching the wiki's "one tier ahead of whatever your enclave currently has" rule generalized across all five systems

### Battle browser UI

- [X] T050 [US3] Implement `GET /api/opponents` (opponents available at the player's current rank) in `src/app/api/opponents/route.ts`
- [X] T051 [US3] Build the Battle Browser page (`src/app/battles/page.tsx`) per the Battles wireframe — boss + challengers list, submit flow
- [X] T052 [US3] Wire build+program selection → battle submission → status polling on the Battle Browser page — verified with a real Playwright smoke run (submits an actual battle, waits for it to resolve through the live sandbox pipeline)

### Tests for User Story 3

- [X] T053 [P] [US3] Unit tests for the damage formula — colocated as `src/engine/damage.test.ts` (see the same colocation-over-`tests/unit/` note from Foundational)
- [X] T054 [P] [US3] Unit tests for grid/facing/turret-rotation rules — `src/engine/grid.test.ts`. Caught and fixed a real bug: `bearingDegrees` had North/South inverted (an `atan2(dx, -dy)` sign error); the fire-resolution integration test below is what exposed it, since the isolated grid-math unit test's own fixture had been constructed with the same inverted sign and was self-consistently wrong
- [X] T055 [P] [US3] Unit tests for power/overload resolution — `src/engine/power.test.ts`
- [X] T056 [US3] Integration test for the engine↔sandbox boundary (an `api` call actually changes tank state) in `tests/integration/engine-sandbox.test.ts` — also caught the bearing bug above, plus a JSON-marshaling bug (`context.evalCode('{"hp":...}')` parses as a block statement, not an object literal, unless wrapped in parens)
- [X] T057 [US3] Integration test for the full queued-submission → simulate → complete lifecycle in `tests/integration/battle-lifecycle.test.ts`
- [X] T058 [P] [US3] Adversarial test: an infinite loop in pilot code is contained by the step-count budget in `tests/adversarial/infinite-loop.test.ts` — caught a real WASM disposal bug: the interpreter wasn't disposing the QuickJS result handle on the interrupted-execution path, which corrupted the runtime's GC state and crashed on a later `dispose()`
- [X] T059 [P] [US3] Adversarial test: a memory-exhaustion attempt is contained in `tests/adversarial/memory-exhaustion.test.ts`
- [X] T060 [P] [US3] Adversarial test: forbidden API access (filesystem/network) attempts fail in `tests/adversarial/forbidden-access.test.ts` — includes a constructor-chain sandbox-escape attempt, not just plain global lookups
- [X] T061 [US3] Determinism test: identical build+program+seed produces a byte-identical tick log across repeated runs in `tests/determinism/replay-determinism.test.ts`

**Checkpoint**: User Stories 1, 2, and 3 functional — a player can build, code, and fight rank 1 end-to-end.

---

## Phase 6: User Story 4 - Watch and revisit replays (Priority: P2)

**Goal**: A player scrubs a completed battle's full tick-by-tick replay, and can find it again later from history.

**Independent Test**: Complete a battle, open its replay, scrub to an arbitrary tick, confirm state/log messages match the simulation (spec Acceptance Scenarios 1-4).

### Tests for User Story 4

- [X] T062 [P] [US4] Integration test: `GET /api/battles/:id/log` is only available once `status = complete` in `tests/integration/replay-log.test.ts` — split into two deterministic tests (a directly-inserted `queued` row for the 409 case, a real completed battle for the 200 case) rather than racing a real battle's now-sub-second simulation time

### Implementation for User Story 4

- [X] T063 [US4] Implement `GET /api/battles/:id/log` route handler in `src/app/api/battles/[id]/log/route.ts` — found and fixed a real ordering bug: the worker was flipping status to `complete` *before* inserting the log row, so a client polling status could briefly see `complete` with no log to fetch yet (404). Log is now written first.
- [X] T064 [US4] Extend `GET /api/battles` to serve the player's full battle history in `src/app/api/battles/route.ts`
- [X] T065 [US4] Build the Replay Viewer page (`src/app/replay/[battleId]/page.tsx`) per the Replay Viewer wireframe — play/pause/scrub, tank state at tick, `pilot`/`system`-tagged log messages
- [X] T066 [US4] Build the Battles page's history tab (list past battles, link into replay) in `src/app/battles/page.tsx` — `src/components/battles/BattleHistory.tsx`
- [X] T067 [US4] Wire replay scrubbing to tick-log playback end-to-end — verified with a Playwright smoke run (submit → resolve → open replay → scrub via slider → play/pause actually advances ticks)

**Checkpoint**: Full spec.md vertical slice functional for rank 1 (all four user stories).

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T068 [P] Build the Home page (`src/app/page.tsx`) per the Home wireframe — real lore copy from the wiki's Home.md, live rank/battle/win stats, not placeholder content
- [X] T069 [P] Build the Pilot Profile/Garage page (`src/app/profile/page.tsx`) per the Pilot Profile wireframe — rank, unlocked tiers, saved builds/programs summary, real win/loss record computed from battle history
- [X] T070 Author ranks 2-10's opponents (boss + 3 challengers each, 36 total) across `src/engine/opponents/`, seeded into the Boss/Practice Challenger table — behavioral sophistication escalates by rank (HP-relative retreat thresholds, power-gated scanning, terrain/moveCost judgment, named mode state machines, alternating retreat headings, shot-discipline-by-range), each rank combining rather than replacing what the previous rank introduced. Added `maxHp`/`maxPowerReserves` to `self()` (contracts/pilot-code-api.md updated) since HP-relative decisions need them and the original contract only exposed absolute `hp`. All 40 entries validated for real (syntax + defines `pilotCode(api)`) in `tests/integration/opponents-registry.test.ts`, not just assumed correct by inspection — this caught a real missing-brace syntax error in the rank-8 boss before it ever reached seed data.
- [X] T071 [P] Accessibility pass against the WCAG 2.1 AA target (keyboard operability, visible focus, semantic landmarks) across all six pages — real automated `@axe-core/playwright` scans (wcag2a/wcag2aa) wired into the e2e suite, not a manual eyeball pass. Caught and fixed two genuine violations: `--color-text-dim` only hit 3.23:1 contrast against panel backgrounds (needs 4.5:1 — lightened `#6f6858` → `#8f8574`), and the Replay Viewer's tick scrubber `<input type="range">` had no accessible label (added `aria-label`).
- [X] T072 [P] Mobile-usability pass on Home/Profile/Battles/Replay (Builder and Code stay desktop-first per Principle III) — real Playwright checks at a 390px viewport (`e2e/mobile-usability.spec.ts`) asserting no horizontal overflow, not just visual inspection. Caught and fixed a genuine bug: `Nav`'s link row had no wrapping and forced horizontal overflow on every page at mobile width; added `flex-wrap`.
- [X] T073 e2e Playwright test covering the full quickstart.md scenario in `e2e/core-battle-loop.spec.ts` — build a tank → save pilot code → fight → view replay → confirm history/profile reflect it, plus the accessibility scans above run inline at each step. Along the way, added a "New Build" reset action to the Tank Builder (parity with the Coding page's "New Program") — a real UX gap the test surfaced: there was previously no way to start a fresh build without editing whatever was most recently saved.
- [X] T074 Run quickstart.md's manual validation scenario end-to-end — covered by T073's e2e run (same steps, executed for real against the live sandbox/engine each time, not a one-off manual click-through).
- [X] T075 Update `README.md`, `CHANGELOG.md`, and `status.md` per Principle VI
- [X] T076 Capture any implementation-time architecture decisions not already covered by `docs/adr/0001-0003` as new ADRs — `docs/adr/0004-imperative-non-blocking-queue.md` (per-system action queuing, decided during implementation, not in the original plan)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — blocks all user stories.
- **US1 (Phase 3)** and **US2 (Phase 4)**: Both depend only on Foundational; genuinely independent of each other and can proceed in parallel.
- **US3 (Phase 5)**: Depends on Foundational. Doesn't require US1/US2's UI to exist to be *built*, but its own independent test (submitting a battle) needs a build and a program to exist, so exercising it end-to-end in practice follows US1+US2.
- **US4 (Phase 6)**: Depends on US3 (there's nothing to replay until a battle can complete).
- **Polish (Phase 7)**: Depends on all four user stories.

### Within User Story 3

Sandbox/engine core (T028-T040) blocks battle queue & progression (T041-T044), which blocks opponent content (T045-T049) and the browser UI (T050-T052). Tests (T053-T061) can be written alongside their corresponding implementation tasks per Principle V, but the adversarial and determinism suites (T058-T061) need the full engine (through T044) to exist to run meaningfully.

### Parallel Opportunities

- All `[P]`-marked Setup and Foundational tasks.
- US1 and US2 (Phases 3-4) as a whole, worked by different people/sessions.
- Within US3: the three sandbox-safety tasks (T030, T031) after T028-T029; all three rank-1 practice challengers (T046-T048) once T045 establishes the pattern; all four test categories (T053-T055, T058-T060) once their target code exists.
- T068-T069 (Home, Profile) alongside anything else in Polish — neither depends on prior Polish tasks.

---

## Parallel Example: User Story 1

```bash
Task: "Integration test: POST /api/builds rejects over-weight-capacity builds in tests/integration/builds.test.ts"
Task: "Integration test: POST /api/builds rejects locked tiers in tests/integration/builds.test.ts"
Task: "Unit tests for unlocks.ts and weight-validation.ts in tests/unit/parts-catalog.test.ts"
```

---

## Implementation Strategy

### MVP First

1. Setup + Foundational.
2. US1 + US2 (independent, can run in parallel) — a player can build and code, even before fighting works.
3. US3 — the core value proposition; **stop here and validate** against rank 1 only (T045-T049), not all 40 opponents.
4. US4 — replay/history close the loop.
5. **This is a demoable MVP**: build → code → fight rank 1 → replay, before Polish's remaining 36 opponents exist.

### Incremental Delivery

Foundation → US1+US2 → US3 (rank 1 only) → US4 → demo the full loop → Polish (Home/Profile pages, remaining 9 ranks' worth of opponents, accessibility, e2e). Each step is independently testable and adds value without breaking what came before, per spec.md's story independence design.

---

## Notes

- `[P]` tasks touch different files with no dependency on an incomplete task.
- `[Story]` labels trace every task back to spec.md's prioritized user stories.
- Commit after each task or logical group, per Principle VI (atomic commits, changelog/status/ADR kept current).
- The 40-opponent content commitment is deliberately NOT on the MVP-demoable critical path (T070 is Polish, not US3) — see plan.md's Complexity Tracking for why this sequencing is what keeps that scope disciplined rather than a violation of it.
