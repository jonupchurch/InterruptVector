# ADR 0004: Per-system non-blocking action queue for the Pilot Code `api`

**Status**: Accepted
**Date**: 2026-07-11
**Related**: [specs/001-core-battle-loop/contracts/pilot-code-api.md](../../specs/001-core-battle-loop/contracts/pilot-code-api.md), constitution Principle II

## Context

The Pilot Code wiki page had already settled the high-level shape
before implementation began: `api` calls never block pilot code
execution, and a call made while a system (movement, turret, fire,
sensors) is still busy queues behind the in-progress action rather
than being rejected. What hadn't been settled was the concrete
mechanism -- specifically, whether "queues" meant literally deferring
the *effect* of a call, or just deferring when its cost is paid.

This mattered for `fire()` in particular: a queued shot has to
actually resolve (check aim, range, line of sight, apply damage)
against the opponent's state *at the moment the queued cooldown
clears*, not at the moment the call was originally made -- the
opponent may have moved in between. Getting this wrong either meant
resolving damage against stale state, or silently not resolving a
queued shot at all.

## Decision

Each of the four systems (movement, turret, fire, sensors) is modeled
as an independent two-slot queue: a `current` in-flight action with a
countdown, and at most one `queued` action waiting behind it (depth
capped at 1, so a pilot can't front-load a match's worth of actions on
tick one -- an explicit design goal from the wiki, not just an
implementation convenience).

```ts
interface SystemQueue<T> {
  current: { action: T; ticksRequired: number } | null;
  ticksRemaining: number;
  queued: { action: T; ticksRequired: number } | null;
}
```

A `request()` call starts the action immediately if the system is
idle, or replaces the queued slot if busy. Advancing one tick either
counts down the current action or, when it finishes, promotes the
queued action to current (and reports that promotion distinctly from
the original request, via a `started` field) -- and it's exactly that
promotion moment where `fire()`'s damage actually resolves, against
whatever the opponent's live state is at that tick, not a snapshot
from when the shot was originally called.

## Rationale

- **Matches the already-agreed non-blocking contract exactly**: pilot
  code (player or one of the 40 opponents) never suspends -- every
  `api` call returns synchronously every time, whether it started
  immediately, queued, or triggered a promotion this tick.
- **Correct damage timing for queued shots**: resolving `fire()`'s
  effect at promotion time (not request time) is the only way a queued
  shot can meaningfully hit a moving target, and is what the
  `advanceTankQueues` / `resolveFire` split in
  `src/engine/sandbox/api-bindings.ts` exists to get right.
- **One shape for all four systems**: movement, turret rotation
  (manual heading or `rotateTurretToXY`), and fire all reuse the same
  `SystemQueue<T>` regardless of how different their actual effects
  are, keeping `src/engine/queue.ts` a small, independently-testable
  module rather than four bespoke state machines.

## Consequences

- `sensors()` does *not* use this queue -- it can't defer its return
  value the way a void-returning call can defer its effect, so a call
  made during its 1-tick cooldown just fails (returns `-1`), same
  signal as insufficient Power Reserves. This is a deliberate
  asymmetry, not an oversight (see the Pilot Code wiki's discussion of
  why `sensors()` couldn't follow the same pattern).
- The queue depth cap (1) is enforced uniformly across all four
  systems via the same mechanism, so there's no per-system special
  case to keep in sync if the cap value ever changes.
