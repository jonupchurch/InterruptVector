# Feature Specification: Core Battle Loop (Build → Code → Fight → Replay)

**Feature Branch**: `001-core-battle-loop`

**Created**: 2026-07-11

**Status**: Draft

**Input**: User description: "The full MVP vertical slice defined by the project constitution (Principle IV) and the Interrupt Vector wiki: a player builds a tank from a fixed part catalog (Chassis, Weapon, Sensors, Mobility, Power), writes JavaScript pilot code against the documented Pilot Code API, saves both, and fights their way up a ten-rank boss ladder — one fixed, individually-coded scripted boss per rank, plus an optional roster of non-gating practice challengers per unlocked tier — with every match simulated server-side, deterministically, and viewable afterward as a full replay. Includes the supporting pages already wireframed: Home, Pilot Profile/Garage, The Bay (tank builder), The Socket (code editor), Battles (battle browser + history), and the Replay Viewer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a tank (Priority: P1)

A player assembles a tank by picking one part from each of the five systems (Chassis, Weapon, Sensors, Mobility, Power), limited to tiers they've already unlocked by rank, and saves the result as a named build.

**Why this priority**: Nothing else in the loop is possible without a build to fight with. It's also independently valuable on its own — a player can explore the part catalog and trade-offs before ever writing code or fighting.

**Independent Test**: Can be fully tested by assembling a build from unlocked parts, saving it, and confirming it reloads with the same parts and derived stats (e.g. Speed, Total Weight) on return.

**Acceptance Scenarios**:

1. **Given** a rank-1 player with only tier-1 parts unlocked, **When** they open the tank builder, **Then** only tier-1 options are selectable for each of the five systems.
2. **Given** a player has selected a Chassis, Mobility, and Power Plant whose combined weight would exceed the Chassis's Weight Capacity, **When** they attempt to save the build, **Then** the system blocks the save and explains which combination is over budget.
3. **Given** a player has a valid, saved build, **When** they return to the tank builder later, **Then** the same parts and derived stats are shown exactly as saved.

---

### User Story 2 - Write and save pilot code (Priority: P1)

A player writes JavaScript against the documented Pilot Code API (`self`, `sensors`, `rotateTank`, `rotateTurret`, `rotateTurretToXY`, `moveForward`/`moveBackward`, `fire`, `canMove`, `moveCost`, `log`) in a code editor, and saves it as a named, reusable program.

**Why this priority**: Equally foundational to User Story 1 — a build with no code can't fight. Independently testable and valuable: a player can iterate on pilot logic and save multiple attempts before ever entering a battle.

**Independent Test**: Can be fully tested by writing a program, saving it, closing the editor, and reopening the same program with its contents intact.

**Acceptance Scenarios**:

1. **Given** a player writes a syntactically invalid program, **When** they attempt to save it, **Then** the system surfaces the error without losing their unsaved text.
2. **Given** a player has multiple saved programs, **When** they open the code editor, **Then** they can select which saved program to view or edit by name.
3. **Given** a player selects a saved program while preparing a battle, **When** they submit for battle, **Then** that exact saved program version is what runs.

---

### User Story 3 - Fight a boss or practice challenger (Priority: P1)

A player pairs a saved build with a saved program, submits it into battle against their current rank's mandatory boss (or an optional practice challenger from an already-unlocked tier), and receives a win/loss result once the match finishes simulating.

**Why this priority**: This is the core value proposition of the whole game — everything else exists to feed this moment. Without it, User Stories 1 and 2 have no payoff.

**Independent Test**: Can be fully tested by submitting a build+program pair against a boss and confirming a deterministic win or loss result is returned, with rank advancing on a boss win.

**Acceptance Scenarios**:

1. **Given** a player at rank N with a valid build and program, **When** they fight rank N's boss and win, **Then** their rank advances to N+1 and the next tier's parts become selectable in the tank builder.
2. **Given** a player fights a boss and loses, **When** they check their rank, **Then** it is unchanged and they may retry with the same or a revised build/program.
3. **Given** a battle reaches the match tick limit with neither tank destroyed, **When** the match ends, **Then** the player receives a loss regardless of relative damage dealt or HP remaining.
4. **Given** a player's pilot code throws an uncaught exception on a given tick, **When** the match continues, **Then** only the calls made before the exception take effect that tick, and the match proceeds normally on the next tick.
5. **Given** a player's pilot code exceeds its per-tick execution budget on three consecutive ticks, **When** the third violation occurs, **Then** the match ends immediately as a loss for that player.
6. **Given** a player has already unlocked tier-3 parts, **When** they open the battle browser, **Then** they can choose to fight either the rank-3 boss or any available tier-appropriate practice challenger, in addition to any lower-tier challenger already unlocked.

---

### User Story 4 - Watch and revisit replays (Priority: P2)

A player opens the replay of any battle they've completed — immediately after a fight, or later from their own battle history — and scrubs through the full tick-by-tick playback, including logged status messages.

**Why this priority**: High value but not blocking — a player could technically know they won/lost from the result alone. The replay is what makes the result legible and enjoyable, and what makes debugging pilot code practical.

**Independent Test**: Can be fully tested by completing a battle, opening its replay, scrubbing to an arbitrary tick, and confirming tank positions/state and any logged messages at that tick match what the simulation actually produced.

**Acceptance Scenarios**:

1. **Given** a completed battle, **When** a player opens its replay, **Then** they can play, pause, and scrub to any tick between 1 and the match's final tick.
2. **Given** a battle where either pilot used `log()`, **When** the player scrubs to the tick a message was logged on, **Then** that message is visible, distinguishable from system-generated messages (errors, runaway-protection notices).
3. **Given** a player has completed multiple battles over time, **When** they open their battle history, **Then** every past battle they participated in is listed and its replay is reachable from that list.
4. **Given** the same stored build, program, and match seed, **When** a replay is generated twice, **Then** both are byte-identical.

---

### Edge Cases

- What happens when a player attempts to submit a battle with no saved program attached to the build, or a program that references no API calls at all (a tank that never acts)? System MUST allow the match to run — an inert pilot is a valid (if losing) strategy, not an error.
- What happens when a player tries to select a part tier above their current rank's unlock level (e.g. via a manipulated request)? System MUST reject it server-side regardless of what the client sends.
- What happens when a `sensors()` call is made with insufficient Power Reserves to cover its cost? System MUST define and enforce one consistent outcome (see FR-015).
- What happens when a pilot's code causes the WASM sandbox to exceed its memory ceiling rather than its step-count budget? System MUST handle this as a distinct failure mode from the step-count budget, per FR-013.
- What happens if a player tries to fight the same boss again after already defeating it? System MUST allow re-fighting a previously-defeated boss (e.g. for practice or a better result), without re-granting the tier unlock a second time.
- What happens when two or more battles are submitted around the same time? System MUST queue and simulate them as server capacity allows, not require a live/real-time execution slot per submission.

## Requirements *(mandatory)*

### Functional Requirements

**Tank building**

- **FR-001**: System MUST let a player assemble a tank build from exactly one Chassis, one Weapon, one Sensor, one Mobility, and one Power Plant, each selected from a fixed catalog of tiers.
- **FR-002**: System MUST restrict selectable tiers, per system, to those already unlocked at the player's current rank (Chassis/Weapon: one tier per rank up to rank 10; Sensors/Mobility/Power: one new tier every two ranks).
- **FR-003**: System MUST reject (and explain) any build where combined Mobility + Power Plant + Weapon weight exceeds the selected Chassis's Weight Capacity.
- **FR-004**: System MUST let a player save a build under a name and reload it unchanged later.

**Pilot code**

- **FR-005**: System MUST provide a code editor in which a player writes JavaScript pilot code, and MUST let them save it as a named, reusable program independent of any specific tank build.
- **FR-006**: System MUST let a player attach one saved program to a build when submitting for battle.
- **FR-007**: System MUST execute pilot code only inside a sandboxed, isolated JavaScript interpreter with no network access, no filesystem access, and no ability to reach the host or any other process.
- **FR-008**: System MUST call the pilot's code once per simulated tick, every tick of a match, passing an `api` object rather than pausing/resuming pilot code between calls.
- **FR-009**: System MUST expose, at minimum, the following `api` calls to pilot code: `self()`, `canMove()`, `moveCost()`, `sensors()`, `rotateTank(direction)`, `rotateTurret(direction)`, `rotateTurretToXY(x, y)`, `moveForward(n)`, `moveBackward(n)`, `fire()`, `log(message)`.
- **FR-010**: System MUST persist a pilot's code's module-level variables across every tick of a single match, resetting only when a new match begins.
- **FR-011**: System MUST let a call to a busy system (movement, turret, firing, sensors) queue behind that system's in-progress action rather than being rejected or blocking pilot code execution, with movement/turret/firing/sensors tracked as independent, non-blocking systems.
- **FR-012**: System MUST enforce a step-count execution budget on every per-tick call to pilot code (not a wall-clock timer), terminating only the remainder of that tick's execution when exceeded while preserving whatever `api` calls already fired that tick.
- **FR-013**: System MUST forfeit a match as a loss for a pilot whose code exceeds its execution budget (step-count or memory) on three consecutive ticks.
- **FR-014**: System MUST let pilot code emit arbitrary text via `log()`, tagged to the tick it was logged on and distinguishable from system-generated log entries (errors, runaway-protection notices).
- **FR-015**: System MUST charge each `sensors()` call a flat 1 Power Reserves, the same at every Sensor tier, in addition to its fixed 1-tick execution cost. If Reserves can't cover the 1-point cost at call time, the call MUST fail and return an error value (consistent with `moveForward`/`moveBackward`'s `-1`-on-failure convention) rather than drain Reserves negative or silently succeed. A tank only enters overload/hibernation (per the Power system's existing rule) when Reserves are fully empty *and* that tick's Output is already exhausted by other draws — a failed `sensors()` call alone does not force an overload.

**Battle simulation**

- **FR-016**: System MUST simulate every battle server-side, deterministically, to completion before any result or replay becomes available — no live spectating of an in-progress match.
- **FR-017**: System MUST queue submitted battles for simulation as server capacity allows, rather than guaranteeing immediate/real-time execution.
- **FR-018**: System MUST cap every match at a configurable tick limit (default: 3,000 ticks, at a fixed rate of 10 ticks per second of simulated time) and end it as a loss for the player if neither tank is destroyed by that limit, regardless of relative damage or remaining HP.
- **FR-019**: System MUST calculate damage as `max(1, Base Damage − max(0, Target Armor − Weapon AP))` for every weapon except the Gauss Cannon, which MUST instead deal its flat base damage regardless of target Armor or its own AP.
- **FR-020**: System MUST simulate combat on a 100×100 grid, with each tank's footprint a square sized from its Chassis's Profile stat, hull and manual turret facing quantized to 8 directions, turret rotation at a fixed 45°-per-5-tick rate, and `rotateTurretToXY` alone permitted to aim at an exact bearing using the full-steps-plus-free-remainder rule.
- **FR-021**: System MUST apply per-cell terrain speed multipliers to movement (Concrete, Grass, Hills, Swamp, Shallow Water, Deep Water) and MUST treat Mountain cells as impassable and blocking to both sensing and firing.
- **FR-022**: System MUST generate each match's map so that terrain is mirrored across the lower-left/upper-right diagonal, with the player spawning lower-left and their opponent upper-right.
- **FR-023**: System MUST produce, for every simulated match, a complete tick-by-tick record (tank state, every `api` call and its result, damage events, `log()` messages) sufficient to reconstruct a full replay, with any randomness drawn during simulation recorded as its actual rolled value rather than re-derived on playback.

**Boss ladder & progression**

- **FR-024**: System MUST gate a player's advancement from rank N to rank N+1 on defeating rank N's mandatory boss.
- **FR-025**: System MUST provide ten fixed, non-learning, individually-authored scripted bosses, one per ladder rank, each running on its own tier-appropriate part loadout.
- **FR-026**: System MUST bound each boss's per-tick compute/action budget equivalently to a sandboxed player tank's, even though bosses are project-authored and not themselves sandboxed.
- **FR-027**: System MUST grant the player the defeated rank's next-tier parts (as applicable per FR-002's unlock cadence) immediately upon defeating that rank's boss.
- **FR-028**: System MUST allow re-fighting a previously-defeated boss without re-granting its tier unlock a second time.
- **FR-029**: System MUST offer, per tier the player has already unlocked, a roster of exactly three optional, non-gating practice-challenger opponents distinct from that tier's mandatory boss (30 practice challengers total across the ten tiers, in addition to the ten bosses).

**Replay & history**

- **FR-030**: System MUST let a player play, pause, and scrub the full tick-by-tick replay of any battle they participated in, from tick 1 through the match's final tick.
- **FR-031**: System MUST let a player browse a list of every battle they've participated in and open any of them as a replay.

**Pages**

- **FR-032**: System MUST provide, at minimum, a home page, a player profile/garage page, a tank-builder page, a pilot-code editor page, a battle-browser page (mandatory boss, practice challengers, and battle history), and a replay-viewer page.

### Key Entities

- **Pilot Profile**: The player's persistent identity — current rank, which part tiers are unlocked, and the owning reference for their saved builds, programs, and battle history. Single-owner/no-login for v1 (see Assumptions).
- **Tank Build**: A named, saved selection of exactly one part per system (Chassis, Weapon, Sensors, Mobility, Power), owned by a Pilot Profile.
- **Pilot Code Program**: A named, saved piece of JavaScript source, owned by a Pilot Profile independently of any one Tank Build. Programs are a shared library — the same saved program can be attached to and reused across multiple different Tank Builds, not scoped to a single build.
- **Boss / Practice Challenger**: A scripted opponent with a fixed part loadout and individually-authored behavior, associated with one rank tier, flagged as either the mandatory gate (boss) or optional (challenger).
- **Battle**: A single simulated match record — the two participants' build+program snapshots as submitted, the outcome, and the full tick-by-tick log described in FR-023.
- **Replay**: The playable reconstruction of a Battle's tick-by-tick log.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time player can go from an empty profile to completing their first boss battle (win or lose), using only in-product guidance, in a single sitting.
- **SC-002**: Re-deriving a replay from the same stored build, program, and match seed produces a byte-identical result 100% of the time.
- **SC-003**: A player can locate and open the replay of any of their own past battles in three actions or fewer from their profile.
- **SC-004**: 100% of adversarial sandbox test cases (infinite loops, memory exhaustion attempts, forbidden API access attempts, timing side-channel attempts) are contained or terminated without affecting match integrity or overall server stability.
- **SC-005**: A player can reach a working, submittable build+program pair using only the documented Pilot Code API — no undocumented behavior is required to field a valid tank.
- **SC-006**: Matches complete simulation and become available as a result/replay within a bounded, predictable time of submission under normal server load, even though execution is queued rather than immediate.

## Assumptions

- Single-owner, no-login for v1 — "Pilot Profile" is effectively a single implicit profile for now; the data model doesn't preclude multiple profiles later, but auth/accounts are explicitly out of scope for this feature (see constitution, Technology Constraints).
- Matches are simulated server-side and queued; there is no real-time or live-spectated match execution in scope.
- The code editor and tank builder are desktop-first per Principle III; the remaining pages (home, profile, battle browser, replay viewer) must be usable on mobile.
- The sandbox technology is the already-decided embedded WASM JavaScript interpreter (see constitution, Technology Constraints) — this spec describes required behavior, not the interpreter choice itself.
- Exact per-boss behavior logic for each of the ten ladder bosses is content to be authored during implementation, not a requirement this spec enumerates individually; FR-025/FR-026 constrain the *shape* every boss must conform to, not each one's specific strategy.
- "Fun/practice" and "boss" opponents share the same underlying opponent model (FR-025/FR-026 apply to both), differing only in whether defeating them gates rank advancement.
