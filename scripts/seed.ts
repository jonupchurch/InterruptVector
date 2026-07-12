/**
 * Idempotent seed: the single implicit Pilot Profile (spec
 * Assumptions -- single-owner/no-login for v1) and all 40 opponents
 * (10 bosses + 30 practice challengers, see src/engine/opponents).
 *
 * Run with: npm run db:seed
 */
import { db } from "../src/db";
import { opponents, pilotProfiles } from "../src/db/schema";
import { unlockedTiersForRank } from "../src/lib/unlocks";

async function seedPilotProfile() {
  const existing = await db.select().from(pilotProfiles).limit(1);
  if (existing.length > 0) {
    console.log("Pilot Profile already exists, skipping.");
    return;
  }
  const [profile] = await db.insert(pilotProfiles).values({ rank: 1 }).returning();
  console.log("Seeded Pilot Profile:", profile);
}

interface OpponentSeed {
  rankTier: number;
  kind: "boss" | "challenger";
  name: string;
  behaviorModule: string;
}

const OPPONENTS: OpponentSeed[] = [
  { rankTier: 1, kind: "boss", name: "The Watchman", behaviorModule: "rank-1-boss" },
  { rankTier: 1, kind: "challenger", name: "The Drone", behaviorModule: "rank-1-challenger-1" },
  { rankTier: 1, kind: "challenger", name: "The Sentry", behaviorModule: "rank-1-challenger-2" },
  { rankTier: 1, kind: "challenger", name: "The Rammer", behaviorModule: "rank-1-challenger-3" },
  { rankTier: 2, kind: "boss", name: "The Marksman", behaviorModule: "rank-2-boss" },
  { rankTier: 2, kind: "challenger", name: "The Scout", behaviorModule: "rank-2-challenger-1" },
  { rankTier: 2, kind: "challenger", name: "The Wall", behaviorModule: "rank-2-challenger-2" },
  { rankTier: 2, kind: "challenger", name: "The Skirmisher", behaviorModule: "rank-2-challenger-3" },
  { rankTier: 3, kind: "boss", name: "The Tactician", behaviorModule: "rank-3-boss" },
  { rankTier: 3, kind: "challenger", name: "The Harrier", behaviorModule: "rank-3-challenger-1" },
  { rankTier: 3, kind: "challenger", name: "The Bulwark", behaviorModule: "rank-3-challenger-2" },
  { rankTier: 3, kind: "challenger", name: "The Hunter", behaviorModule: "rank-3-challenger-3" },
  { rankTier: 4, kind: "boss", name: "The Warden", behaviorModule: "rank-4-boss" },
  { rankTier: 4, kind: "challenger", name: "The Phantom", behaviorModule: "rank-4-challenger-1" },
  { rankTier: 4, kind: "challenger", name: "The Anvil", behaviorModule: "rank-4-challenger-2" },
  { rankTier: 4, kind: "challenger", name: "The Viper", behaviorModule: "rank-4-challenger-3" },
  { rankTier: 5, kind: "boss", name: "The Strategist", behaviorModule: "rank-5-boss" },
  { rankTier: 5, kind: "challenger", name: "The Ranger", behaviorModule: "rank-5-challenger-1" },
  { rankTier: 5, kind: "challenger", name: "The Juggernaut", behaviorModule: "rank-5-challenger-2" },
  { rankTier: 5, kind: "challenger", name: "The Reaper", behaviorModule: "rank-5-challenger-3" },
  { rankTier: 6, kind: "boss", name: "The Enforcer", behaviorModule: "rank-6-boss" },
  { rankTier: 6, kind: "challenger", name: "The Nomad", behaviorModule: "rank-6-challenger-1" },
  { rankTier: 6, kind: "challenger", name: "The Bastion", behaviorModule: "rank-6-challenger-2" },
  { rankTier: 6, kind: "challenger", name: "The Stalker", behaviorModule: "rank-6-challenger-3" },
  { rankTier: 7, kind: "boss", name: "The Sentinel", behaviorModule: "rank-7-boss" },
  { rankTier: 7, kind: "challenger", name: "The Ghost", behaviorModule: "rank-7-challenger-1" },
  { rankTier: 7, kind: "challenger", name: "The Colossus", behaviorModule: "rank-7-challenger-2" },
  { rankTier: 7, kind: "challenger", name: "The Predator", behaviorModule: "rank-7-challenger-3" },
  { rankTier: 8, kind: "boss", name: "The Overseer", behaviorModule: "rank-8-boss" },
  { rankTier: 8, kind: "challenger", name: "The Wraith", behaviorModule: "rank-8-challenger-1" },
  { rankTier: 8, kind: "challenger", name: "The Fortress", behaviorModule: "rank-8-challenger-2" },
  { rankTier: 8, kind: "challenger", name: "The Executioner", behaviorModule: "rank-8-challenger-3" },
  { rankTier: 9, kind: "boss", name: "The Architect", behaviorModule: "rank-9-boss" },
  { rankTier: 9, kind: "challenger", name: "The Specter", behaviorModule: "rank-9-challenger-1" },
  { rankTier: 9, kind: "challenger", name: "The Titan", behaviorModule: "rank-9-challenger-2" },
  { rankTier: 9, kind: "challenger", name: "The Assassin", behaviorModule: "rank-9-challenger-3" },
  { rankTier: 10, kind: "boss", name: "The Successor's Vanguard", behaviorModule: "rank-10-boss" },
  { rankTier: 10, kind: "challenger", name: "The Herald", behaviorModule: "rank-10-challenger-1" },
  { rankTier: 10, kind: "challenger", name: "The Monolith", behaviorModule: "rank-10-challenger-2" },
  { rankTier: 10, kind: "challenger", name: "The Harbinger", behaviorModule: "rank-10-challenger-3" },
];

const MAX_CHASSIS_WEAPON_TIER = 10;
const MAX_FIVE_TIER_SYSTEM_TIER = 5;

/**
 * "Every Successor construct is built from its own hardware... all
 * one tier ahead of whatever your enclave currently has salvage
 * rights to" (Progression wiki) -- an opponent guarding rank N uses
 * the tiers a rank-(N+1) player would have unlocked. Rank 10 has no
 * "rank 11" to reach toward (the catalog tops out at Chassis/Weapon
 * tier 10, the five-tier systems at tier 5), so its opponents are
 * clamped to the same maximum a rank-10 player has -- the peak of
 * what's earnable, not a nonexistent tier beyond it.
 */
function gearForOpponentRank(rankTier: number) {
  const tiers = unlockedTiersForRank(rankTier + 1);
  return {
    chassisTier: Math.min(tiers.chassis, MAX_CHASSIS_WEAPON_TIER),
    weaponTier: Math.min(tiers.weapon, MAX_CHASSIS_WEAPON_TIER),
    sensorTier: Math.min(tiers.sensor, MAX_FIVE_TIER_SYSTEM_TIER),
    mobilityTier: Math.min(tiers.mobility, MAX_FIVE_TIER_SYSTEM_TIER),
    powerTier: Math.min(tiers.power, MAX_FIVE_TIER_SYSTEM_TIER),
  };
}

async function seedOpponents() {
  const existing = await db.select().from(opponents);
  const existingModules = new Set(existing.map((o) => o.behaviorModule));
  const missing = OPPONENTS.filter((o) => !existingModules.has(o.behaviorModule));

  if (missing.length === 0) {
    console.log("All 40 opponents already seeded, skipping.");
    return;
  }

  const rows = await db
    .insert(opponents)
    .values(missing.map((o) => ({ ...o, ...gearForOpponentRank(o.rankTier) })))
    .returning();
  console.log(`Seeded ${rows.length} new opponents (${existing.length} already present).`);
}

async function main() {
  await seedPilotProfile();
  await seedOpponents();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
