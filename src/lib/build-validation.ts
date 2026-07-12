import type { BuildInput } from "./build-schema";
import { isWithinUnlockedTiers, unlockedTiersForRank } from "./unlocks";
import { validateWeightCapacity } from "./weight-validation";

export interface BuildValidationError {
  field: string;
  message: string;
}

/**
 * Server-side re-validation of a build against the player's *current*
 * rank -- never trust the client (Principle II). Combines spec FR-002
 * (tier unlocks) and FR-003 (weight capacity) into the one check the
 * API layer needs.
 */
export function validateBuild(rank: number, input: BuildInput): BuildValidationError[] {
  const errors: BuildValidationError[] = [];

  const selection = {
    chassisTier: input.chassisTier,
    weaponTier: input.weaponTier,
    sensorTier: input.sensorTier,
    mobilityTier: input.mobilityTier,
    powerTier: input.powerTier,
  };

  if (!isWithinUnlockedTiers(rank, selection)) {
    const unlocked = unlockedTiersForRank(rank);
    errors.push({
      field: "tiers",
      message: `One or more selected tiers exceed what's unlocked at rank ${rank} (max: Chassis ${unlocked.chassis}, Weapon ${unlocked.weapon}, Sensor ${unlocked.sensor}, Mobility ${unlocked.mobility}, Power ${unlocked.power}).`,
    });
  }

  const weightResult = validateWeightCapacity(selection);
  if (!weightResult.valid) {
    errors.push({
      field: "weight",
      message: `Combined Weapon + Mobility + Power weight (${weightResult.combinedWeight}) exceeds this Chassis's Weight Capacity (${weightResult.weightCapacity}).`,
    });
  }

  return errors;
}
