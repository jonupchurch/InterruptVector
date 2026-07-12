# Interrupt Vector

> Program a tank. Fight a machine. Watch the replay.

A hobby project in the spirit of *Omega* (1989): build a tank from a
small parts catalog, write code against its sensor/action API, and let
it fight — sandboxed, deterministic, replayable.

This is a full restart of a prior project, **t@nk.r**, rescoped to a
smaller v1. See the constitution's provenance note for the full story.

## Status

The **Core Battle Loop** feature — the full MVP vertical slice — is
implemented and passing: build a tank → write pilot code → fight one of
40 scripted opponents across a 10-rank ladder → watch the replay. See
[status.md](status.md) for the live state and
[CHANGELOG.md](CHANGELOG.md) for what's shipped.

## The problem / the idea

Writing a program that controls a tank — reading sensors, deciding when
to move, turn, and fire — and watching it fight is a satisfying, self-
contained programming puzzle. The MVP is one full vertical slice of
that loop: build a tank → write its code → submit it → watch it battle
a scripted opponent → view the result and a full replay. Multiplayer,
ranking, and matchmaking come later, once that loop is solid.

## How it works

- **The Bay** (`/builder`) — assemble a tank from five systems
  (Chassis, Weapon, Sensors, Mobility, Power), each a fixed catalog of
  tiers gated by rank, not a free-form point-buy.
- **The Socket** (`/code`) — write JavaScript pilot code against a
  documented `api` (`self`, `sensors`, `rotateTank`, `rotateTurret`,
  `rotateTurretToXY`, `moveForward`/`moveBackward`, `fire`, `log`,
  `canMove`, `moveCost`) in a Monaco editor; save multiple named
  programs.
- **Battles** (`/battles`) — pair a saved build with a saved program
  and fight your rank's boss or an already-unlocked practice
  challenger. Every match is queued and simulated server-side inside a
  sandboxed WASM JS interpreter (`quickjs-emscripten`) — pilot code
  never runs unsandboxed, never touches the network or filesystem, and
  is bounded by a step-count execution budget, not wall-clock time.
- **Replay** (`/replay/[battleId]`) — every completed battle is
  recorded tick-by-tick and fully scrubbable, including in-character
  radio chatter or debug output from `log()`.
- **Profile** (`/profile`) — rank, unlocked tiers, win/loss record.

Every one of the 40 opponents (10 bosses + 30 optional practice
challengers) runs through the exact same sandboxed `api` as a player's
own code — there's no special-cased AI system, which is also what
keeps the door open for a future PvP mode without rearchitecting the
sandbox boundary.

## Architecture decisions

See [`docs/adr/`](docs/adr/):

- [0001](docs/adr/0001-sandbox-technology.md) — sandbox technology
  (embedded WASM interpreter, not Vercel Sandbox or `isolated-vm`)
- [0002](docs/adr/0002-persistence-postgres-drizzle.md) — persistence
  (PostgreSQL + Drizzle)
- [0003](docs/adr/0003-replay-storage-shape.md) — replay tick-logs as
  Postgres JSONB, not object storage, for v1
- [0004](docs/adr/0004-imperative-non-blocking-queue.md) — per-system
  action queuing for the Pilot Code `api` (movement/turret/fire/sensors
  queue independently rather than blocking or rejecting)

## Process

This repo follows [GitHub Spec Kit](https://github.com/github/spec-kit)'s
spec-driven workflow — constitution → spec → plan → tasks → implement —
governed by the [project constitution](.specify/memory/constitution.md).
The full spec/plan/tasks for the Core Battle Loop feature live under
[`specs/001-core-battle-loop/`](specs/001-core-battle-loop/).

## Running this project

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL
npm run db:migrate           # apply schema
npm run db:seed              # single Pilot Profile + all 40 opponents
npm run dev                  # http://localhost:3000
npm run typecheck
npm run lint
npm run test                 # vitest: unit, integration, adversarial, determinism
npm run test:e2e             # playwright: full vertical slice + accessibility + mobile
npm run build
```

Drizzle config lives in `drizzle.config.ts` / `src/db/`. The battle
engine lives in `src/engine/` (sandbox, tick simulation, opponents);
the Pilot Code `api` contract is documented in
[`specs/001-core-battle-loop/contracts/pilot-code-api.md`](specs/001-core-battle-loop/contracts/pilot-code-api.md).
