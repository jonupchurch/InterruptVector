import { describe, expect, it } from "vitest";
import { combinedSystemWeight, validateWeightCapacity } from "./weight-validation";

describe("weight-validation", () => {
  it("sums Weapon + Mobility + Power weight", () => {
    // tier-1 weapon (Light Cannon, weight 2) + tier-1 mobility (weight 1) + tier-1 power (weight 1) = 4
    expect(
      combinedSystemWeight({ weaponTier: 1, mobilityTier: 1, powerTier: 1 }),
    ).toBe(4);
  });

  it("passes when combined weight is within the chassis's weight capacity", () => {
    // Whippet (tier 1) has weightCapacity 6; tier-1 weapon+mobility+power = 4
    const result = validateWeightCapacity({
      chassisTier: 1,
      weaponTier: 1,
      sensorTier: 1,
      mobilityTier: 1,
      powerTier: 1,
    });
    expect(result.valid).toBe(true);
    expect(result.weightCapacity).toBe(6);
    expect(result.combinedWeight).toBe(4);
  });

  it("fails when combined weight exceeds the chassis's weight capacity", () => {
    // Whippet (tier 1, weightCapacity 6) paired with tier-10 weapon (6) + tier-5 mobility (5) + tier-5 power (5) = 16
    const result = validateWeightCapacity({
      chassisTier: 1,
      weaponTier: 10,
      sensorTier: 1,
      mobilityTier: 5,
      powerTier: 5,
    });
    expect(result.valid).toBe(false);
    expect(result.weightCapacity).toBe(6);
    expect(result.combinedWeight).toBe(16);
  });
});
