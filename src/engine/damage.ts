import type { WeaponSpec } from "@/lib/parts-catalog";

/**
 * Damage formula (wiki 1.1.2-Weapon, spec FR-019):
 *   Effective Armor = max(0, Target Armor - AP)
 *   Damage Dealt    = max(1, Base Damage - Effective Armor)
 * The Gauss Cannon ignores this formula entirely and deals its flat
 * base damage regardless of Armor or its own (absent) AP.
 */
export function calculateDamage(weapon: WeaponSpec, targetArmor: number): number {
  if (weapon.ignoresArmor) {
    return weapon.damage;
  }
  const armorPiercing = weapon.armorPiercing ?? 0;
  const effectiveArmor = Math.max(0, targetArmor - armorPiercing);
  return Math.max(1, weapon.damage - effectiveArmor);
}
