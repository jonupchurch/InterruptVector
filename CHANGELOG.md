# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- **Core Battle Loop feature complete** — the full MVP vertical slice
  (`specs/001-core-battle-loop/`): spec (32 functional requirements, 4
  prioritized user stories), plan, research, data model, contracts,
  and a 76-task breakdown, all implemented:
  - **Build a tank** (The Bay, `/builder`) — five-system part picker
    gated by rank, server-side re-validation of tier unlocks and
    weight capacity, save/reload multiple named builds.
  - **Write and save pilot code** (The Socket, `/code`) — Monaco
    editor, syntax + `pilotCode(api)`-definition validation at save
    time, multiple named saved programs.
  - **Fight a boss or practice challenger** (Battles, `/battles`) —
    the full battle engine: a WASM-sandboxed JS interpreter
    (`quickjs-emscripten`, one fully isolated module per tank per
    match) running the documented `api`
    (`self`/`canMove`/`moveCost`/`sensors`/`rotateTank`/
    `rotateTurret`/`rotateTurretToXY`/`moveForward`/`moveBackward`/
    `fire`/`log`), a deterministic tick loop (grid/facing/terrain/
    damage/power resolution, per-system non-blocking action queuing),
    a step-count execution budget with three-strikes forfeit for
    runaway code, and a queued/async battle worker. All 40 ladder
    opponents (10 bosses + 30 practice challengers across ranks 1-10)
    are individually hand-coded, with behavioral sophistication
    escalating by rank, and run through the identical sandboxed `api`
    as player code — no special-cased AI system.
  - **Watch and revisit replays** (Replay Viewer, `/replay/[id]`;
    history on the Battles page) — full tick-by-tick playback with
    play/pause/scrub and pilot/system-tagged log messages.
  - **Home** and **Pilot Profile** pages with real data (lore copy,
    live rank/record/build/program stats).
  - Real design system (colors/type transcribed from the project's
    wireframes) replacing the `create-next-app` default.
- Four ADRs (`docs/adr/`): sandbox technology (WASM), persistence
  (Postgres/Drizzle), replay storage shape (Postgres JSONB), and the
  Pilot Code `api`'s per-system non-blocking action queue.
- Test suite: 125 Vitest tests (unit, integration, adversarial sandbox-
  escape, determinism/replay-reproducibility) plus a Playwright e2e
  suite covering the full vertical slice, automated WCAG 2.1 AA
  accessibility scans (`@axe-core/playwright`), and mobile-viewport
  overflow checks.
- Scaffolded the project with GitHub Spec Kit (Claude Code integration,
  PowerShell scripts, `.specify/` templates and workflow).
- Drafted and revised the project constitution (v0.2.0-draft) — a full
  restart of the prior t@nk.r project under the new name Interrupt
  Vector, v1 rescoped to the full ten-rank boss ladder (not a single
  fight) vs. one player tank, no multiplayer/ranking/auth yet.
- Scaffolded the Next.js app per the constitution's Technology
  Constraints: App Router, TypeScript strict, Tailwind CSS, `src/`
  layout, `npm`, Zod, Drizzle ORM against Postgres, Vitest, Playwright.

### Fixed
- Several real bugs caught by tests rather than assumed away: a
  North/South sign inversion in the turret-bearing formula, a JSON-
  round-trip marshaling bug that broke every object-returning sandbox
  host function, a WASM handle-disposal leak on the runaway-execution
  path that crashed the interpreter on cleanup, a battle-worker
  ordering bug that could expose `status: complete` before its replay
  log actually existed, a battle left stuck at `simulating` forever on
  an unexpected error (now a `failed` status with a surfaced message),
  insufficient text contrast against panel backgrounds, a missing
  accessible label on the replay scrubber, and a navigation bar that
  overflowed horizontally on mobile viewports.
