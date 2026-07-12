/**
 * Tier-unlock rules (spec FR-002): Chassis/Weapon unlock one tier per
 * rank; Sensors/Mobility/Power unlock one tier every two ranks.
 */

export function maxChassisOrWeaponTier(rank: number): number {
  return rank;
}

export function maxFiveTierSystemTier(rank: number): number {
  return Math.ceil(rank / 2);
}

export interface UnlockedTiers {
  chassis: number;
  weapon: number;
  sensor: number;
  mobility: number;
  power: number;
}

export function unlockedTiersForRank(rank: number): UnlockedTiers {
  return {
    chassis: maxChassisOrWeaponTier(rank),
    weapon: maxChassisOrWeaponTier(rank),
    sensor: maxFiveTierSystemTier(rank),
    mobility: maxFiveTierSystemTier(rank),
    power: maxFiveTierSystemTier(rank),
  };
}

export interface BuildTierSelection {
  chassisTier: number;
  weaponTier: number;
  sensorTier: number;
  mobilityTier: number;
  powerTier: number;
}

/** Every selected tier must be <= what's unlocked at the given rank. */
export function isWithinUnlockedTiers(rank: number, selection: BuildTierSelection): boolean {
  const unlocked = unlockedTiersForRank(rank);
  return (
    selection.chassisTier <= unlocked.chassis &&
    selection.weaponTier <= unlocked.weapon &&
    selection.sensorTier <= unlocked.sensor &&
    selection.mobilityTier <= unlocked.mobility &&
    selection.powerTier <= unlocked.power
  );
}
