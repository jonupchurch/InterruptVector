import { describe, expect, it } from "vitest";
import { calculateDamage } from "./damage";
import { weaponByTier } from "@/lib/parts-catalog";

describe("calculateDamage", () => {
  it("subtracts effective armor from base damage", () => {
    const lightCannon = weaponByTier(1); // damage 8, AP 1
    expect(calculateDamage(lightCannon, 6)).toBe(3); // 8 - max(0, 6-1) = 8-5 = 3
  });

  it("floors damage at 1, never zero or negative", () => {
    const lightCannon = weaponByTier(1); // damage 8, AP 1
    expect(calculateDamage(lightCannon, 100)).toBe(1);
  });

  it("fully negates armor once AP exceeds it", () => {
    const heavyLaser = weaponByTier(6); // damage 14, AP 10
    expect(calculateDamage(heavyLaser, 9)).toBe(14); // AP(10) > armor(9), effective armor 0
  });

  it("Gauss Cannon ignores armor entirely, dealing flat damage", () => {
    const gauss = weaponByTier(9); // damage 2, ignoresArmor true
    expect(calculateDamage(gauss, 1000)).toBe(2);
  });
});
