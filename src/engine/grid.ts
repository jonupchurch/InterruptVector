/**
 * Grid, footprint, and facing rules (wiki 3.0-Battlefield, spec
 * FR-020). Directions are indexed 0-7 clockwise from North, matching
 * the pilot-facing `1`-`8` / two-letter-code encoding in
 * contracts/pilot-code-api.md.
 */

export const DIRECTION_CODES = ["NN", "NE", "EE", "SE", "SS", "SW", "WW", "NW"] as const;
export type DirectionCode = (typeof DIRECTION_CODES)[number];
export type Direction = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | DirectionCode;

export interface Point {
  x: number;
  y: number;
}

/** Returns a 0-7 index (0 = North, clockwise). Throws on an invalid direction. */
export function parseDirection(direction: Direction): number {
  if (typeof direction === "number") {
    if (direction < 1 || direction > 8) throw new Error(`Invalid direction: ${direction}`);
    return direction - 1;
  }
  const index = DIRECTION_CODES.indexOf(direction);
  if (index === -1) throw new Error(`Invalid direction: ${direction}`);
  return index;
}

export function directionIndexToCode(index: number): DirectionCode {
  return DIRECTION_CODES[((index % 8) + 8) % 8];
}

/** Shortest number of 45-degree steps between two headings (0-4). */
export function stepsBetween(fromIndex: number, toIndex: number): number {
  const diff = Math.abs(fromIndex - toIndex) % 8;
  return Math.min(diff, 8 - diff);
}

/** Chassis footprint is a square, one side-square per 2 tiers of Profile. */
export function footprintSquares(profile: number): number {
  return Math.ceil(profile / 2);
}

/** Hull turning: a step-count *budget* per fixed 10-tick window, not a per-step rate. */
export function ticksForHullTurn(steps: number, turnRate: number): number {
  if (steps === 0) return 0;
  return Math.ceil(steps / turnRate) * 10;
}

/** Turret manual rotation: fixed, universal, continuous 45-degrees-per-5-ticks rate. */
export function ticksForTurretTurn(steps: number): number {
  return steps * 5;
}

/**
 * Bearing from `from` to `to`, in degrees, 0-360, clockwise from North
 * (0 = North, 90 = East, 180 = South, 270 = West).
 */
export function bearingDegrees(from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // North (index 0) is +Y (see DIRECTION_DELTAS below); atan2(dx, dy)
  // measures clockwise from +Y, matching that convention directly --
  // do not negate dy here (that was a bug caught by an integration
  // test: it silently inverted North/South while still "working" in
  // isolation because a same-signed test fixture masked it).
  const deg = (Math.atan2(dx, dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

const DIRECTION_DELTAS: Point[] = [
  { x: 0, y: 1 }, // N
  { x: 1, y: 1 }, // NE
  { x: 1, y: 0 }, // E
  { x: 1, y: -1 }, // SE
  { x: 0, y: -1 }, // S
  { x: -1, y: -1 }, // SW
  { x: -1, y: 0 }, // W
  { x: -1, y: 1 }, // NW
];

/** The grid cell immediately in front of (or behind, for reverse) a tank facing headingIndex, clamped to the grid. */
export function cellAhead(position: Point, headingIndex: number, gridSize: number, forward: boolean): Point {
  const delta = DIRECTION_DELTAS[headingIndex];
  const sign = forward ? 1 : -1;
  return {
    x: Math.min(gridSize - 1, Math.max(0, position.x + delta.x * sign)),
    y: Math.min(gridSize - 1, Math.max(0, position.y + delta.y * sign)),
  };
}

export function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export interface TurretAimCost {
  steps: number;
  remainderDegrees: number;
  ticks: number;
}

/**
 * rotateTurretToXY's cost: full 45-degree steps at the normal 5-ticks-
 * each rate to cover the largest multiple of 45 at or below the
 * bearing, then the leftover fractional remainder is free.
 */
export function turretAimCost(bearing: number): TurretAimCost {
  const steps = Math.floor(bearing / 45);
  const remainderDegrees = bearing - steps * 45;
  return { steps, remainderDegrees, ticks: ticksForTurretTurn(steps) };
}
