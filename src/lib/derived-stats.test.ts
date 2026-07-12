import { describe, expect, it } from "vitest";
import { derivedStats } from "./derived-stats";

describe("derivedStats", () => {
  it("computes Total Weight and Speed for a tier-1 build", () => {
    // Whippet weight 1 + tier-1 mobility weight 1 + tier-1 power weight 1 + tier-1 weapon (Light Cannon) weight 2 = 5
    // Speed = tier-1 engine power (5) / 5 = 1
    const { totalWeight, speed } = derivedStats({
      chassisTier: 1,
      weaponTier: 1,
      sensorTier: 1,
      mobilityTier: 1,
      powerTier: 1,
    });
    expect(totalWeight).toBe(5);
    expect(speed).toBe(1);
  });
});
