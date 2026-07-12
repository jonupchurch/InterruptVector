# Implementation Plan: Core Battle Loop (Build → Code → Fight → Replay)

**Branch**: `001-core-battle-loop` | **Date**: 2026-07-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-core-battle-loop/spec.md`

## Summary

Deliver the full MVP vertical slice: a player assembles a tank from a fixed five-system part catalog, writes and saves reusable JavaScript pilot code against the documented `api`, and fights their way up a ten-rank boss ladder (10 bosses + 30 practice challengers, all individually hand-coded) with every match simulated server-side inside a sandboxed WASM JS interpreter, deterministically, and viewable afterward as a full tick-by-tick replay. Technical approach: a single Next.js (App Router) application already scaffolded with TypeScript/Tailwind/Zod/Drizzle/Postgres/Vitest/Playwright; a new battle-simulation engine module owns the tick loop and hosts the sandboxed interpreter; matches are queued and simulated server-side rather than requiring a live execution slot.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), Next.js 16 (App Router), React 19. Pilot code itself is player-authored JavaScript, executed inside the sandbox, not part of the app's own codebase.

**Primary Dependencies**: Next.js, React, Zod (env + input validation), Drizzle ORM + `postgres` driver, Tailwind CSS v4 — all already scaffolded. New for this feature: a WASM-based JS interpreter for the pilot-code sandbox, and a code-editor component for the coding page (both resolved in Phase 0 research below).

**Storage**: PostgreSQL via Drizzle — pilot profile, tank builds, saved pilot-code programs, boss/practice-challenger definitions, battle records. Replay tick-log storage shape (DB column vs. object storage) is resolved in Phase 0 research (constitution flags this as an owed ADR).

**Testing**: Vitest + Testing Library (unit/integration, already scaffolded), Playwright (e2e, already scaffolded). Per Principle V, this feature additionally requires adversarial sandbox-escape tests and determinism (byte-identical replay) tests as their own first-class categories, not folded into generic unit tests.

**Target Platform**: Web, deployed on Vercel (Next.js server functions / Fluid Compute for battle simulation, per the project's existing Vercel context). No native mobile target.

**Project Type**: Single web application (Next.js App Router handles both UI and server-side route handlers — no separate frontend/backend split).

**Performance Goals**: Not real-time-bound — matches are queued and simulated whenever server resources are available (per spec FR-017), so there is no per-request latency SLA on simulation itself. Standard page-load responsiveness for all UI (sub-second navigation) is still expected.

**Constraints**: Principle II (no network/filesystem access from pilot code; hard CPU-step and memory limits per tick; server-side, deterministic simulation only — no live spectating). Principle III (WCAG 2.1 AA target; code editor and tank builder are desktop-first, all other pages must work on mobile; distinctive visual identity per the six existing wireframes: Home, Pilot Profile, The Bay, The Socket, Battles, Replay Viewer). Principle V (determinism: identical stored build + code + seed MUST reproduce a byte-identical replay).

**Scale/Scope**: Single-owner, no-login for v1 (Technology Constraints). Ten ladder ranks, each with 1 mandatory boss + 3 practice challengers = 40 individually-coded scripted opponents. Six top-level pages plus the battle engine and Pilot Code `api` (10 methods: `self`, `canMove`, `moveCost`, `sensors`, `rotateTank`, `rotateTurret`, `rotateTurretToXY`, `moveForward`, `moveBackward`, `fire`, `log`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Spec-Driven Development & Legible Architecture)**: PASS, with follow-through required. Three ADRs are owed per Technology Constraints and this plan (sandbox technology, Postgres/Drizzle persistence, replay storage shape) — written as part of Phase 0 research output below rather than left as prose-only, per Principle I's "MUST be captured in a short ADR before or alongside the code that implements it."
- **Principle II (Sandboxed Execution & Fair-Fight Integrity)**: PASS. The engine/sandbox split in Project Structure below keeps the sandbox boundary isolated from the rest of the app, and is architected so a second sandboxed combatant (future PvP) can be substituted for a scripted opponent without rearchitecting the boundary itself (both bosses and, later, PvP defenders run through the identical `engine/opponents` + sandbox path).
- **Principle III (Designed, Accessible Experience)**: PASS. All six MVP pages already have wireframes to build from; no page is being designed from scratch during implementation.
- **Principle IV (Product Judgment & Scope Discipline)**: PASS, flagged in Complexity Tracking. Forty individually-coded scripted opponents is a large, deliberate content-authoring commitment (already reconciled with this principle in the constitution's v0.2.0-draft revision) — the risk isn't constitutional violation, it's sequencing; see Complexity Tracking for how tasks should stage this rather than block the first demoable slice on all 40 being done.
- **Principle V (Test Discipline)**: PASS. Project Structure below gives adversarial and determinism tests their own top-level test directories, not folded into generic unit tests, matching the constitution's non-negotiable carve-out for exactly these two categories.
- **Principle VI (Legible History)**: N/A to this gate — a process constraint on how work is committed, not a design gate.

No unjustified violations. One entry in Complexity Tracking below, already justified by the constitution itself.

**Post-Design Re-Check** (after Phase 1 data-model/contracts/quickstart): Still PASS on all six.
Notably: the Pilot Code `api` contract (`contracts/pilot-code-api.md`)
is written once and used identically by player code and all 40
opponents (Principle II's forward-compatibility requirement holds
concretely, not just in principle); `data-model.md`'s Battle
snapshotting rule (build/program copied at submission time, not
live-referenced) is what actually makes Principle V's determinism
guarantee true in the presence of a player continuing to edit their
saved builds/programs after a battle; ADR 0003's "not a lock-in"
framing means Principle IV's scope discipline (Postgres-only for v1)
doesn't foreclose the object-storage path if it's ever needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-battle-loop/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/                        # Next.js App Router routes
│   ├── page.tsx                 # Home
│   ├── profile/                 # Pilot Profile / Garage
│   ├── builder/                 # The Bay - tank builder
│   ├── code/                    # The Socket - pilot code editor + saved programs
│   ├── battles/                 # Battle browser (boss, practice challengers, history)
│   ├── replay/[battleId]/       # Replay Viewer
│   └── api/                     # Route handlers (battle submission/status, etc.)
├── engine/                      # Battle simulation engine — owns ticks/timing
│   ├── sandbox/                 # WASM interpreter integration, host-function bindings for the `api`
│   ├── simulate.ts              # Deterministic tick loop: movement, turret, damage, power resolution
│   ├── replay-log.ts            # Tick-by-tick event recording (state, api calls, damage, log messages)
│   └── opponents/                # Project-authored pilot code for the 10 bosses + 30 practice challengers
├── db/                          # Drizzle schema + client (schema additions to already-scaffolded src/db/)
├── lib/                         # Shared domain logic: parts catalog/tiers, unlock rules, damage formula
├── components/                  # Shared UI components (design-system-driven, per Principle III)
└── env.ts                       # Already-scaffolded Zod env validation

tests/
├── unit/                        # part/stat calc, damage formula, `api` marshaling, unlock-rule logic
├── integration/                 # engine ↔ sandbox boundary, DB persistence round-trips, queue/cooldown behavior
├── adversarial/                 # sandbox-escape attempts: infinite loops, memory exhaustion, forbidden API access
├── determinism/                 # same stored build + code + seed → byte-identical replay, repeated runs
└── e2e/                         # Playwright: build tank → save code → fight boss → view replay

docs/
├── future-work.md
└── adr/
    ├── 0001-sandbox-technology.md
    ├── 0002-persistence-postgres-drizzle.md
    └── 0003-replay-storage-shape.md
```

**Structure Decision**: Single Next.js application (no frontend/backend split — App Router route handlers serve as the backend). The battle-simulation engine is isolated under `src/engine/`, with the sandbox boundary further isolated under `src/engine/sandbox/`, so Principle II's boundary stays a single, identifiable seam that future PvP can reuse rather than something scattered across route handlers. `src/db/`, `src/lib/env.ts` already exist from the earlier scaffold and are extended, not replaced.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 40 individually-coded scripted opponents (10 bosses + 30 practice challengers) in MVP scope | Confirmed as deliberate v1 scope (constitution v0.2.0-draft, Principle IV) — the boss ladder *is* the core loop, and practice challengers were explicitly pulled into launch scope rather than deferred | A single shared AI algorithm was considered (see earlier design discussion) and explicitly rejected by the project owner in favor of bespoke per-opponent behavior; task sequencing (not scope-cutting) is how this stays disciplined — e.g. rank 1's boss + challengers can reach full vertical-slice demoability long before rank 10's content exists |
