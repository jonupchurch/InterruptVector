import { chassisByTier, mobilityByTier, powerPlantByTier, weaponByTier } from "./parts-catalog";
import type { BuildTierSelection } from "./unlocks";

/**
 * Spec FR-003: combined Mobility + Power Plant + Weapon weight must
 * not exceed the selected Chassis's Weight Capacity.
 */
export function combinedSystemWeight(selection: Pick<BuildTierSelection, "weaponTier" | "mobilityTier" | "powerTier">): number {
  return (
    weaponByTier(selection.weaponTier).weight +
    mobilityByTier(selection.mobilityTier).weight +
    powerPlantByTier(selection.powerTier).weight
  );
}

export interface WeightValidationResult {
  valid: boolean;
  weightCapacity: number;
  combinedWeight: number;
}

export function validateWeightCapacity(selection: BuildTierSelection): WeightValidationResult {
  const weightCapacity = chassisByTier(selection.chassisTier).weightCapacity;
  const combinedWeight = combinedSystemWeight(selection);
  return {
    valid: combinedWeight <= weightCapacity,
    weightCapacity,
    combinedWeight,
  };
}
