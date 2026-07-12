import type { ChassisSpec, MobilitySpec, PowerPlantSpec, SensorSpec, WeaponSpec } from "@/lib/parts-catalog";
import type { Point } from "./grid";
import type { PowerState } from "./power";
import { createSystemQueue, type SystemQueue } from "./queue";

export interface MoveAction {
  forward: boolean;
  squares: number;
}
export interface TurnAction {
  headingIndex: number;
}
export type TurretAction = { kind: "heading"; headingIndex: number } | { kind: "xy"; x: number; y: number };

export interface Bogey {
  distance: number;
  x: number;
  y: number;
}

export interface LogEntry {
  tick: number;
  tankId: string;
  source: "pilot" | "system";
  message: string;
}

export interface TankParts {
  chassis: ChassisSpec;
  weapon: WeaponSpec;
  sensor: SensorSpec;
  mobility: MobilitySpec;
  power: PowerPlantSpec;
}

export interface TankRuntimeState {
  id: string;
  hp: number;
  maxHp: number;
  position: Point;
  headingIndex: number;
  turretBearingDegrees: number;
  power: PowerState;
  parts: TankParts;
  moveQueue: SystemQueue<MoveAction>;
  turnQueue: SystemQueue<TurnAction>;
  turretQueue: SystemQueue<TurretAction>;
  fireQueue: SystemQueue<true>;
  sensorsCooldownTicks: number;
  lastBogeys: Bogey[] | null;
  destroyed: boolean;
}

export function totalWeight(parts: TankParts): number {
  return parts.chassis.weight + parts.mobility.weight + parts.power.weight + parts.weapon.weight;
}

/** Squares per tick, on Concrete (multiplier 1.0) -- terrain multiplies this further. */
export function baseSpeed(parts: TankParts): number {
  return parts.mobility.enginePower / totalWeight(parts);
}

export function createTankRuntimeState(id: string, parts: TankParts, position: Point): TankRuntimeState {
  return {
    id,
    hp: parts.chassis.hitPoints,
    maxHp: parts.chassis.hitPoints,
    position,
    headingIndex: 0,
    turretBearingDegrees: 0,
    power: { reserves: parts.power.reserves, maxReserves: parts.power.reserves, output: parts.power.output, overloaded: false },
    parts,
    moveQueue: createSystemQueue(),
    turnQueue: createSystemQueue(),
    turretQueue: createSystemQueue(),
    fireQueue: createSystemQueue(),
    sensorsCooldownTicks: 0,
    lastBogeys: null,
    destroyed: false,
  };
}
