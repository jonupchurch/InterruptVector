/**
 * Fixed part catalog, transcribed from the wiki (1.1.1-Chassis through
 * 1.1.5-Power). Each tier's stats are a fixed row, not a runtime
 * point-buy -- players pick a tier per system, they don't allocate
 * points themselves.
 */

export interface ChassisSpec {
  tier: number;
  name: string;
  weight: number;
  profile: number;
  armor: number;
  hitPoints: number;
  weightCapacity: number;
  camoEcm: number;
}

export const CHASSIS: readonly ChassisSpec[] = [
  { tier: 1, name: "Whippet", weight: 1, profile: 1, armor: 6, hitPoints: 10, weightCapacity: 6, camoEcm: 4 },
  { tier: 2, name: "Jackrabbit", weight: 2, profile: 2, armor: 6, hitPoints: 15, weightCapacity: 6, camoEcm: 5 },
  { tier: 3, name: "Mule", weight: 3, profile: 3, armor: 9, hitPoints: 15, weightCapacity: 9, camoEcm: 5 },
  { tier: 4, name: "Plowhand", weight: 4, profile: 4, armor: 12, hitPoints: 20, weightCapacity: 9, camoEcm: 5 },
  { tier: 5, name: "Roadwright", weight: 5, profile: 5, armor: 12, hitPoints: 25, weightCapacity: 12, camoEcm: 5 },
  { tier: 6, name: "Roughneck", weight: 6, profile: 6, armor: 15, hitPoints: 25, weightCapacity: 15, camoEcm: 5 },
  { tier: 7, name: "Dozer", weight: 7, profile: 7, armor: 18, hitPoints: 30, weightCapacity: 15, camoEcm: 5 },
  { tier: 8, name: "Quarryhauler", weight: 8, profile: 8, armor: 21, hitPoints: 35, weightCapacity: 18, camoEcm: 4 },
  { tier: 9, name: "Foundry Hull", weight: 9, profile: 9, armor: 24, hitPoints: 35, weightCapacity: 21, camoEcm: 4 },
  { tier: 10, name: "Bastion", weight: 10, profile: 10, armor: 27, hitPoints: 40, weightCapacity: 24, camoEcm: 3 },
] as const;

export interface WeaponSpec {
  tier: number;
  name: string;
  damage: number;
  armorPiercing: number | null; // null only for the Gauss Cannon, which ignores armor entirely
  ignoresArmor: boolean;
  fireRateTicks: number;
  powerDraw: number;
  weight: number;
}

export const WEAPONS: readonly WeaponSpec[] = [
  { tier: 1, name: "Light Cannon", damage: 8, armorPiercing: 1, ignoresArmor: false, fireRateTicks: 5, powerDraw: 0, weight: 2 },
  { tier: 2, name: "Medium Cannon", damage: 18, armorPiercing: 6, ignoresArmor: false, fireRateTicks: 6, powerDraw: 0, weight: 3 },
  { tier: 3, name: "Heavy Cannon", damage: 24, armorPiercing: 6, ignoresArmor: false, fireRateTicks: 15, powerDraw: 0, weight: 5 },
  { tier: 4, name: "Light Laser", damage: 5, armorPiercing: 3, ignoresArmor: false, fireRateTicks: 3, powerDraw: 4, weight: 1 },
  { tier: 5, name: "Medium Laser", damage: 7, armorPiercing: 4, ignoresArmor: false, fireRateTicks: 4, powerDraw: 5, weight: 2 },
  { tier: 6, name: "Heavy Laser", damage: 14, armorPiercing: 10, ignoresArmor: false, fireRateTicks: 5, powerDraw: 6, weight: 3 },
  { tier: 7, name: "Rocket Pod", damage: 28, armorPiercing: 7, ignoresArmor: false, fireRateTicks: 20, powerDraw: 0, weight: 4 },
  { tier: 8, name: "Missile Launcher", damage: 35, armorPiercing: 9, ignoresArmor: false, fireRateTicks: 25, powerDraw: 0, weight: 5 },
  { tier: 9, name: "Gauss Cannon", damage: 2, armorPiercing: null, ignoresArmor: true, fireRateTicks: 2, powerDraw: 10, weight: 4 },
  { tier: 10, name: "Rail Gun", damage: 45, armorPiercing: 18, ignoresArmor: false, fireRateTicks: 30, powerDraw: 8, weight: 6 },
] as const;

export interface SensorSpec {
  tier: number;
  range: number;
  powerDraw: number;
}

/** Five tiers, one new tier every two ranks. Scan cost (1 tick + 1 Reserves) is flat across all tiers -- not part of this table. */
export const SENSORS: readonly SensorSpec[] = [
  { tier: 1, range: 30, powerDraw: 2 },
  { tier: 2, range: 35, powerDraw: 4 },
  { tier: 3, range: 40, powerDraw: 6 },
  { tier: 4, range: 45, powerDraw: 8 },
  { tier: 5, range: 50, powerDraw: 10 },
] as const;

export interface MobilitySpec {
  tier: number;
  enginePower: number;
  weight: number;
  turnRate: number; // max 45-degree steps per 10-tick window
  powerDraw: number;
}

/** Five tiers, one new tier every two ranks. */
export const MOBILITY: readonly MobilitySpec[] = [
  { tier: 1, enginePower: 5, weight: 1, turnRate: 1, powerDraw: 2 },
  { tier: 2, enginePower: 10, weight: 2, turnRate: 2, powerDraw: 4 },
  { tier: 3, enginePower: 15, weight: 3, turnRate: 3, powerDraw: 6 },
  { tier: 4, enginePower: 20, weight: 4, turnRate: 4, powerDraw: 8 },
  { tier: 5, enginePower: 25, weight: 5, turnRate: 5, powerDraw: 10 },
] as const;

export interface PowerPlantSpec {
  tier: number;
  weight: number;
  output: number;
  reserves: number;
}

/** Five tiers, one new tier every two ranks. */
export const POWER_PLANTS: readonly PowerPlantSpec[] = [
  { tier: 1, weight: 1, output: 5, reserves: 10 },
  { tier: 2, weight: 2, output: 10, reserves: 20 },
  { tier: 3, weight: 3, output: 15, reserves: 30 },
  { tier: 4, weight: 4, output: 20, reserves: 40 },
  { tier: 5, weight: 5, output: 25, reserves: 50 },
] as const;

export function chassisByTier(tier: number): ChassisSpec {
  const spec = CHASSIS.find((c) => c.tier === tier);
  if (!spec) throw new Error(`No Chassis at tier ${tier}`);
  return spec;
}

export function weaponByTier(tier: number): WeaponSpec {
  const spec = WEAPONS.find((w) => w.tier === tier);
  if (!spec) throw new Error(`No Weapon at tier ${tier}`);
  return spec;
}

export function sensorByTier(tier: number): SensorSpec {
  const spec = SENSORS.find((s) => s.tier === tier);
  if (!spec) throw new Error(`No Sensor at tier ${tier}`);
  return spec;
}

export function mobilityByTier(tier: number): MobilitySpec {
  const spec = MOBILITY.find((m) => m.tier === tier);
  if (!spec) throw new Error(`No Mobility at tier ${tier}`);
  return spec;
}

export function powerPlantByTier(tier: number): PowerPlantSpec {
  const spec = POWER_PLANTS.find((p) => p.tier === tier);
  if (!spec) throw new Error(`No Power Plant at tier ${tier}`);
  return spec;
}
