# Contract: Pilot Code `api`

The trust boundary between untrusted, sandboxed pilot code and the
battle engine (Principle II). This is the most important contract in
the project — both player-submitted code and every one of the 40
project-authored opponents (spec FR-025) are written against exactly
this surface, no special-cased variant for either.

```ts
type Direction =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  | "NN" | "NE" | "EE" | "SE" | "SS" | "SW" | "WW" | "NW";

interface TankStatus {
  hp: number;
  maxHp: number;
  heading: Direction;
  coordinates: { x: number; y: number };
  moving: boolean;
  powerReserves: number;
  maxPowerReserves: number;
  cooldowns: {
    fire: number;         // ticks remaining; 0 = ready
    sensors: number;
    turn: number;          // ticks remaining on current hull-turn commitment
    turretTurn: number;
    move: number;
  };
}

interface Bogey {
  distance: number;
  x: number;
  y: number;
}

interface PilotApi {
  /** Free. Always current. */
  self(): TankStatus;

  /** Free. Terrain cell the tank currently faces. */
  canMove(): boolean;

  /** Free. Ticks to cross the faced cell; 0 = impassable (sentinel, not a real cost). */
  moveCost(): number;

  /**
   * 1 tick + 1 Power Reserves. Snapshot of detected bogeys, doesn't
   * auto-refresh. Returns -1 if Power Reserves can't cover the cost
   * (does not force overload by itself — see the Power wiki page).
   */
  sensors(): Bogey[] | -1;

  /** Queues behind any in-progress hull turn; commits fully to the requested heading. */
  rotateTank(direction: Direction): void;

  /** Queues behind any in-progress turret turn; restricted to the 8 manual headings. */
  rotateTurret(direction: Direction): void;

  /**
   * Aims at an exact coordinate (typically a bogey's last-known x/y)
   * using the free-remainder-snap rule. One-shot aim, not persistent
   * tracking — re-aiming at a moving target costs another `sensors()`
   * call plus another call here.
   */
  rotateTurretToXY(x: number, y: number): void;

  /**
   * Queues movement along current facing. Returns the number of
   * squares actually queued (validated against currently-known
   * terrain), or -1 if the very next square is impassable.
   */
  moveForward(n?: number): number | -1;
  moveBackward(n?: number): number | -1;

  /** Fires immediately if off cooldown; otherwise queues behind the current cooldown. */
  fire(): void;

  /** Debug output or in-character flavor, pilot's choice — same channel either way. */
  log(message: string): void;
}

/** Called once per tick, every tick, for the duration of a match. No return value. */
declare function pilotCode(api: PilotApi): void;
```

## Open implementation decisions (not blocking, but must be resolved before/during implementation)

- Exact JSON shape of `TankStatus`/`Bogey` beyond the fields listed
  above (any additional fields surfaced from Chassis/Weapon/Mobility
  stats).
- Exact representation of a "call made while queued/still resolving"
  — whether pilot code can distinguish "executed now" from "queued,"
  or only observes results via `self()`'s cooldown fields on a later
  tick.
- Per-system queue depth cap (spec-adjacent open question from the
  Pilot Code wiki page) — needed to prevent a pilot from front-loading
  an entire match's worth of actions on tick 1.
- WASM step-count budget and memory ceiling exact values (tuning, not
  a contract shape question).

## Non-negotiables (Principle II)

- No network, filesystem, or process access from inside the sandbox.
- No wall-clock time or unseeded randomness available to pilot code
  (determinism, Principle V).
- Every one of the 40 opponents (10 bosses + 30 challengers) is bound
  by the exact same per-tick step-count/memory budget as a sandboxed
  player tank (spec FR-026), even though opponents aren't themselves
  sandboxed.
