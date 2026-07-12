import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import {
  bearingDegrees,
  cellAhead,
  directionIndexToCode,
  distanceBetween,
  parseDirection,
  stepsBetween,
  ticksForHullTurn,
  ticksForTurretTurn,
  turretAimCost,
  type Direction,
} from "../grid";
import { calculateDamage } from "../damage";
import { attemptSensorsReservesCharge } from "../power";
import { advanceTick as advanceQueue, isBusy, request } from "../queue";
import { GRID_SIZE, TERRAIN_MULTIPLIER, blocksLineOfSight, isPassable, type TerrainGrid } from "../terrain";
import { baseSpeed, type LogEntry, type TankRuntimeState } from "../tank-state";

/** Turret aim tolerance for a hit: half of one 45-degree manual heading sector either side. */
const FIRE_AIM_TOLERANCE_DEGREES = 22.5;
const MAX_LOG_MESSAGE_LENGTH = 1000;
const MAX_LOGS_PER_TICK = 10;

export interface ApiContext {
  self: TankRuntimeState;
  opponent: TankRuntimeState;
  terrain: TerrainGrid;
  currentTick: () => number;
  onLog: (entry: LogEntry) => void;
  logCountThisTick: { value: number };
}

function toHandle(context: QuickJSContext, value: unknown): QuickJSHandle {
  // Wrapped in parens: a bare `{...}` at the start of a script parses
  // as a block statement, not an object-literal expression -- this is
  // what actually makes JSON-round-trip marshaling produce a value
  // rather than a syntax error for any object/array return.
  return context.unwrapResult(context.evalCode(`(${JSON.stringify(value)})`));
}

function turretHeadingIndex(bearingDegreesValue: number): number {
  return Math.round(bearingDegreesValue / 45) % 8;
}

function terrainAt(terrain: TerrainGrid, x: number, y: number) {
  return terrain[Math.round(x)][Math.round(y)];
}

function moveTicksForCell(state: TankRuntimeState, terrain: TerrainGrid, x: number, y: number): number {
  const cell = terrainAt(terrain, x, y);
  if (!isPassable(cell)) return 0;
  const speed = baseSpeed(state.parts) * TERRAIN_MULTIPLIER[cell];
  return Math.max(1, Math.ceil(1 / speed));
}

function hasLineOfSight(terrain: TerrainGrid, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  // Simplified LoS: sample the midpoint cell. A full raycast is future
  // work; this is enough to make Mountain function as real cover
  // without a heavier geometry pass.
  const midX = Math.round((from.x + to.x) / 2);
  const midY = Math.round((from.y + to.y) / 2);
  return !blocksLineOfSight(terrainAt(terrain, midX, midY));
}

function resolveFire(self: TankRuntimeState, opponent: TankRuntimeState, terrain: TerrainGrid): void {
  if (opponent.destroyed) return;
  const distance = distanceBetween(self.position, opponent.position);
  if (distance > self.parts.sensor.range) return;
  if (!hasLineOfSight(terrain, self.position, opponent.position)) return;

  const trueBearing = bearingDegrees(self.position, opponent.position);
  const diff = Math.min(Math.abs(self.turretBearingDegrees - trueBearing), 360 - Math.abs(self.turretBearingDegrees - trueBearing));
  if (diff > FIRE_AIM_TOLERANCE_DEGREES) return;

  const damage = calculateDamage(self.parts.weapon, opponent.parts.chassis.armor);
  opponent.hp = Math.max(0, opponent.hp - damage);
  if (opponent.hp === 0) opponent.destroyed = true;
}

export function installApi(context: QuickJSContext, ctx: ApiContext): QuickJSHandle {
  const apiHandle = context.newObject();

  const selfFn = context.newFunction("self", () => {
    const s = ctx.self;
    return toHandle(context, {
      hp: s.hp,
      maxHp: s.maxHp,
      heading: directionIndexToCode(s.headingIndex),
      coordinates: { x: s.position.x, y: s.position.y },
      moving: isBusy(s.moveQueue),
      powerReserves: s.power.reserves,
      maxPowerReserves: s.power.maxReserves,
      cooldowns: {
        fire: s.fireQueue.ticksRemaining,
        sensors: s.sensorsCooldownTicks,
        turn: s.turnQueue.ticksRemaining,
        turretTurn: s.turretQueue.ticksRemaining,
        move: s.moveQueue.ticksRemaining,
      },
    });
  });
  context.setProp(apiHandle, "self", selfFn);
  selfFn.dispose();

  const canMoveFn = context.newFunction("canMove", () => {
    const ahead = cellAhead(ctx.self.position, ctx.self.headingIndex, GRID_SIZE, true);
    return toHandle(context, isPassable(terrainAt(ctx.terrain, ahead.x, ahead.y)));
  });
  context.setProp(apiHandle, "canMove", canMoveFn);
  canMoveFn.dispose();

  const moveCostFn = context.newFunction("moveCost", () => {
    const ahead = cellAhead(ctx.self.position, ctx.self.headingIndex, GRID_SIZE, true);
    const cell = terrainAt(ctx.terrain, ahead.x, ahead.y);
    if (!isPassable(cell)) return toHandle(context, 0);
    return toHandle(context, moveTicksForCell(ctx.self, ctx.terrain, ahead.x, ahead.y));
  });
  context.setProp(apiHandle, "moveCost", moveCostFn);
  moveCostFn.dispose();

  const sensorsFn = context.newFunction("sensors", () => {
    const s = ctx.self;
    if (s.sensorsCooldownTicks > 0) return toHandle(context, -1);
    const { success, state } = attemptSensorsReservesCharge(s.power);
    if (!success) return toHandle(context, -1);
    s.power = state;
    s.sensorsCooldownTicks = 1;

    const bogeys: { distance: number; x: number; y: number }[] = [];
    if (!ctx.opponent.destroyed) {
      const distance = distanceBetween(s.position, ctx.opponent.position);
      if (distance <= s.parts.sensor.range && hasLineOfSight(ctx.terrain, s.position, ctx.opponent.position)) {
        bogeys.push({ distance, x: ctx.opponent.position.x, y: ctx.opponent.position.y });
      }
    }
    s.lastBogeys = bogeys;
    return toHandle(context, bogeys);
  });
  context.setProp(apiHandle, "sensors", sensorsFn);
  sensorsFn.dispose();

  const rotateTankFn = context.newFunction("rotateTank", (directionHandle) => {
    const direction = context.dump(directionHandle) as Direction;
    const targetIndex = parseDirection(direction);
    const steps = stepsBetween(ctx.self.headingIndex, targetIndex);
    const ticks = ticksForHullTurn(steps, ctx.self.parts.mobility.turnRate);
    ctx.self.turnQueue = request(ctx.self.turnQueue, { headingIndex: targetIndex }, Math.max(1, ticks));
  });
  context.setProp(apiHandle, "rotateTank", rotateTankFn);
  rotateTankFn.dispose();

  const rotateTurretFn = context.newFunction("rotateTurret", (directionHandle) => {
    const direction = context.dump(directionHandle) as Direction;
    const targetIndex = parseDirection(direction);
    const currentIndex = turretHeadingIndex(ctx.self.turretBearingDegrees);
    const steps = stepsBetween(currentIndex, targetIndex);
    const ticks = ticksForTurretTurn(steps);
    ctx.self.turretQueue = request(ctx.self.turretQueue, { kind: "heading", headingIndex: targetIndex }, Math.max(1, ticks));
  });
  context.setProp(apiHandle, "rotateTurret", rotateTurretFn);
  rotateTurretFn.dispose();

  const rotateTurretToXYFn = context.newFunction("rotateTurretToXY", (xHandle, yHandle) => {
    const x = context.dump(xHandle) as number;
    const y = context.dump(yHandle) as number;
    const bearing = bearingDegrees(ctx.self.position, { x, y });
    const cost = turretAimCost(bearing);
    ctx.self.turretQueue = request(ctx.self.turretQueue, { kind: "xy", x, y }, Math.max(1, cost.ticks));
  });
  context.setProp(apiHandle, "rotateTurretToXY", rotateTurretToXYFn);
  rotateTurretToXYFn.dispose();

  function queueMove(forward: boolean, nHandle: QuickJSHandle | undefined): QuickJSHandle {
    const n = nHandle !== undefined ? (context.dump(nHandle) as number) : 1;
    const requested = Math.max(1, Math.floor(n));
    let ticks = 0;
    let queued = 0;
    let cursor = ctx.self.position;
    for (let i = 0; i < requested; i++) {
      const next = cellAhead(cursor, ctx.self.headingIndex, GRID_SIZE, forward);
      const cellTicks = moveTicksForCell(ctx.self, ctx.terrain, next.x, next.y);
      if (cellTicks === 0) break; // impassable -- stop queuing further
      ticks += cellTicks;
      queued++;
      cursor = next;
    }
    if (queued === 0) return toHandle(context, -1);
    ctx.self.moveQueue = request(ctx.self.moveQueue, { forward, squares: queued }, ticks);
    return toHandle(context, queued);
  }

  const moveForwardFn = context.newFunction("moveForward", (nHandle) => queueMove(true, nHandle));
  context.setProp(apiHandle, "moveForward", moveForwardFn);
  moveForwardFn.dispose();

  const moveBackwardFn = context.newFunction("moveBackward", (nHandle) => queueMove(false, nHandle));
  context.setProp(apiHandle, "moveBackward", moveBackwardFn);
  moveBackwardFn.dispose();

  const fireFn = context.newFunction("fire", () => {
    const s = ctx.self;
    const startingImmediately = !isBusy(s.fireQueue);
    s.fireQueue = request(s.fireQueue, true, s.parts.weapon.fireRateTicks);
    if (startingImmediately) {
      resolveFire(s, ctx.opponent, ctx.terrain);
    }
  });
  context.setProp(apiHandle, "fire", fireFn);
  fireFn.dispose();

  const logFn = context.newFunction("log", (messageHandle) => {
    if (ctx.logCountThisTick.value >= MAX_LOGS_PER_TICK) return;
    ctx.logCountThisTick.value++;
    const raw = context.dump(messageHandle);
    const message = String(raw).slice(0, MAX_LOG_MESSAGE_LENGTH);
    ctx.onLog({ tick: ctx.currentTick(), tankId: ctx.self.id, source: "pilot", message });
  });
  context.setProp(apiHandle, "log", logFn);
  logFn.dispose();

  return apiHandle;
}

/**
 * Advances all four per-tank system queues by one tick, applying
 * completed actions' effects. A queued shot fires the instant the
 * weapon's cooldown clears (spec: fire()'s queueing behavior) --
 * that's the `started` transition on the fire queue, resolved here
 * against the opponent's *current* state rather than at request time.
 */
export function advanceTankQueues(state: TankRuntimeState, opponent: TankRuntimeState, terrain: TerrainGrid): void {
  const moveResult = advanceQueue(state.moveQueue);
  state.moveQueue = moveResult.queue;
  if (moveResult.completed) {
    const sign = moveResult.completed.forward ? 1 : -1;
    for (let i = 0; i < moveResult.completed.squares; i++) {
      state.position = cellAhead(state.position, state.headingIndex, GRID_SIZE, sign === 1);
    }
  }

  const turnResult = advanceQueue(state.turnQueue);
  state.turnQueue = turnResult.queue;
  if (turnResult.completed) {
    state.headingIndex = turnResult.completed.headingIndex;
  }

  const turretResult = advanceQueue(state.turretQueue);
  state.turretQueue = turretResult.queue;
  if (turretResult.completed) {
    const action = turretResult.completed;
    state.turretBearingDegrees = action.kind === "heading" ? action.headingIndex * 45 : bearingDegrees(state.position, action);
  }

  const fireResult = advanceQueue(state.fireQueue);
  state.fireQueue = fireResult.queue;
  if (fireResult.started) {
    resolveFire(state, opponent, terrain);
  }

  if (state.sensorsCooldownTicks > 0) state.sensorsCooldownTicks--;
}
