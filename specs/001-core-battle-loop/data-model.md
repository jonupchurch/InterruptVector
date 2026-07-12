# Phase 1 Data Model: Core Battle Loop

Derived from spec.md's Key Entities and Functional Requirements.
Field lists are complete enough to drive a Drizzle schema; exact SQL
types are an implementation detail.

## Pilot Profile

The player's persistent identity. Single implicit row for v1
(no-login — see spec Assumptions), but the shape doesn't preclude
multiple rows later.

| Field | Notes |
|---|---|
| `id` | PK |
| `rank` | integer 1-10, current unlocked rank |
| `created_at` | |

**Derived, not stored**: which part tiers are unlocked. Chassis/Weapon
unlock one tier per rank (tier = rank); Sensors/Mobility/Power unlock
one tier every two ranks (tier = `ceil(rank / 2)`) — computed from
`rank` wherever needed, per spec FR-002.

## Tank Build

A named, saved loadout. One row per saved build.

| Field | Notes |
|---|---|
| `id` | PK |
| `pilot_profile_id` | FK → Pilot Profile |
| `name` | player-chosen |
| `chassis_tier`, `weapon_tier`, `sensor_tier`, `mobility_tier`, `power_tier` | integers, one selected tier per system |
| `created_at`, `updated_at` | |

**Validation rules** (enforced server-side at both save time and
battle-submission time — never trust the client, Principle II):
- Each tier ≤ the Pilot Profile's currently-unlocked tier for that
  system (FR-002).
- Combined Mobility + Power Plant + Weapon weight (looked up from the
  fixed parts catalog in `src/lib`, not stored redundantly here) ≤
  the selected Chassis's Weight Capacity (FR-003).

## Pilot Code Program

A named, saved piece of JavaScript, independent of any one build — a
shared library (Key Entities/spec Q3 resolution).

| Field | Notes |
|---|---|
| `id` | PK |
| `pilot_profile_id` | FK → Pilot Profile |
| `name` | player-chosen |
| `source_code` | text |
| `created_at`, `updated_at` | |

No FK to Tank Build — the association happens per-battle (see Battle
below), so the same program can be attached to different builds across
different battles (FR-006).

## Boss / Practice Challenger

Project-authored opponent definitions — seed/reference data, not
player-editable. Exactly one `boss` and three `challenger` rows per
rank tier (spec FR-025, FR-029 → 10 + 30 = 40 rows total).

| Field | Notes |
|---|---|
| `id` | PK |
| `rank_tier` | integer 1-10 |
| `kind` | enum: `boss` \| `challenger` |
| `name` | |
| `chassis_tier`, `weapon_tier`, `sensor_tier`, `mobility_tier`, `power_tier` | its own fixed loadout, same shape as Tank Build |
| `behavior_module` | reference to the project-authored pilot code implementing this opponent (a code path/module identifier under `src/engine/opponents/`, not a DB-editable text field — bosses are code, not player data) |

## Battle

One simulated match record. Snapshots the build and program used
rather than referencing live, editable rows — a player editing a saved
build or program after a battle MUST NOT change that battle's already-
recorded result or replay (this is what makes Principle V's
determinism guarantee meaningful in the presence of ongoing edits).

| Field | Notes |
|---|---|
| `id` | PK |
| `pilot_profile_id` | FK → Pilot Profile (the player side) |
| `opponent_id` | FK → Boss / Practice Challenger |
| `build_snapshot` | the five tier selections as submitted, copied at submission time, not a live FK |
| `program_source_snapshot` | the JS source as submitted, copied at submission time, not a live FK |
| `seed` | random seed used for this simulation run |
| `status` | enum: `queued` \| `simulating` \| `complete` (FR-016, FR-017) |
| `outcome` | enum: `win` \| `loss`, null until `status = complete` |
| `final_tick` | integer, set on completion — how long the match actually ran (≤ the match tick cap, FR-018) |
| `submitted_at`, `simulated_at` | |

**State transitions**: `queued → simulating → complete`, one
direction only, no re-simulation of a completed Battle (a replay reads
the stored log, it never re-runs the sandbox — research.md).

**Rank advancement**: Pilot Profile's `rank` increments by 1 only when
a Battle completes with `outcome = win` against an opponent where
`kind = boss` and `rank_tier = ` the profile's rank at submission time
(FR-024). Re-defeating an already-cleared boss does not advance rank
again (FR-028, Edge Cases).

## Battle Log

The tick-by-tick replay source, one row per Battle (1:1), stored as
JSONB per [ADR 0003](../../docs/adr/0003-replay-storage-shape.md).

| Field | Notes |
|---|---|
| `battle_id` | PK, FK → Battle |
| `tick_log` | JSONB — array of per-tick entries; each entry MUST be able to represent both tanks' state, every `api` call made and its result, damage events, and `log()` messages for that tick (FR-023), tagged by source (`pilot` vs `system`) per the Pilot Code wiki spec |

Exact internal JSON shape is an implementation detail for `tasks.md`,
constrained by FR-023 and FR-030/FR-031's requirement that a replay be
fully scrubbable tick-by-tick.

## Relationships

```text
Pilot Profile 1───* Tank Build
Pilot Profile 1───* Pilot Code Program
Pilot Profile 1───* Battle
Boss/Challenger 1───* Battle   (as opponent_id)
Battle          1───1 Battle Log
```
