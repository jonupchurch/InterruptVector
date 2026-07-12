import { describe, expect, it } from "vitest";
import { isWithinUnlockedTiers, maxChassisOrWeaponTier, maxFiveTierSystemTier, unlockedTiersForRank } from "./unlocks";

describe("unlocks", () => {
  it("unlocks one Chassis/Weapon tier per rank", () => {
    expect(maxChassisOrWeaponTier(1)).toBe(1);
    expect(maxChassisOrWeaponTier(7)).toBe(7);
    expect(maxChassisOrWeaponTier(10)).toBe(10);
  });

  it("unlocks a new five-tier system every two ranks", () => {
    expect(maxFiveTierSystemTier(1)).toBe(1);
    expect(maxFiveTierSystemTier(2)).toBe(1);
    expect(maxFiveTierSystemTier(3)).toBe(2);
    expect(maxFiveTierSystemTier(4)).toBe(2);
    expect(maxFiveTierSystemTier(9)).toBe(5);
    expect(maxFiveTierSystemTier(10)).toBe(5);
  });

  it("computes all five unlocked tiers for a given rank", () => {
    expect(unlockedTiersForRank(4)).toEqual({
      chassis: 4,
      weapon: 4,
      sensor: 2,
      mobility: 2,
      power: 2,
    });
  });

  it("accepts a selection entirely within unlocked tiers", () => {
    expect(
      isWithinUnlockedTiers(4, { chassisTier: 4, weaponTier: 3, sensorTier: 2, mobilityTier: 1, powerTier: 2 }),
    ).toBe(true);
  });

  it("rejects a selection that reaches above an unlocked tier", () => {
    expect(
      isWithinUnlockedTiers(1, { chassisTier: 1, weaponTier: 1, sensorTier: 2, mobilityTier: 1, powerTier: 1 }),
    ).toBe(false);
  });
});
