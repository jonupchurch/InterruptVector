/**
 * Idempotent seed: the single implicit Pilot Profile (spec
 * Assumptions -- single-owner/no-login for v1) and the rank-1
 * opponents (see src/engine/opponents).
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

async function seedRank1Opponents() {
  const existing = await db.select().from(opponents).limit(1);
  if (existing.length > 0) {
    console.log("Opponents already seeded, skipping.");
    return;
  }

  // "Every Successor construct is built from its own hardware... all
  // one tier ahead of whatever your enclave currently has salvage
  // rights to" (Progression wiki) -- the opponents guarding the
  // rank-1-to-2 transition use the tiers a rank-2 player would have
  // unlocked, not the player's current rank-1 tiers.
  const gearTiers = unlockedTiersForRank(2);
  const gear = {
    chassisTier: gearTiers.chassis,
    weaponTier: gearTiers.weapon,
    sensorTier: gearTiers.sensor,
    mobilityTier: gearTiers.mobility,
    powerTier: gearTiers.power,
  };

  const rows = await db
    .insert(opponents)
    .values([
      { rankTier: 1, kind: "boss", name: "The Watchman", ...gear, behaviorModule: "rank-1-boss" },
      { rankTier: 1, kind: "challenger", name: "The Drone", ...gear, behaviorModule: "rank-1-challenger-1" },
      { rankTier: 1, kind: "challenger", name: "The Sentry", ...gear, behaviorModule: "rank-1-challenger-2" },
      { rankTier: 1, kind: "challenger", name: "The Rammer", ...gear, behaviorModule: "rank-1-challenger-3" },
    ])
    .returning();
  console.log(`Seeded ${rows.length} rank-1 opponents.`);
}

async function main() {
  await seedPilotProfile();
  await seedRank1Opponents();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
