import { chassisByTier, mobilityByTier, powerPlantByTier, weaponByTier } from "./parts-catalog";
import type { BuildTierSelection } from "./unlocks";

/** Speed = Engine Power / Total Weight; Total Weight = Chassis + Mobility + Power + Weapon weight (wiki: 1.1.4-Mobility). */
export function derivedStats(selection: BuildTierSelection) {
  const chassis = chassisByTier(selection.chassisTier);
  const weapon = weaponByTier(selection.weaponTier);
  const mobility = mobilityByTier(selection.mobilityTier);
  const power = powerPlantByTier(selection.powerTier);

  const totalWeight = chassis.weight + mobility.weight + power.weight + weapon.weight;
  const speed = mobility.enginePower / totalWeight;

  return { totalWeight, speed };
}
