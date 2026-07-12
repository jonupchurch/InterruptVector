/**
 * Idempotent seed: the single implicit Pilot Profile (spec
 * Assumptions -- single-owner/no-login for v1) and the rank-1
 * opponents once they exist (see src/engine/opponents).
 *
 * Run with: npx tsx scripts/seed.ts
 */
import { db } from "../src/db";
import { pilotProfiles } from "../src/db/schema";

async function seedPilotProfile() {
  const existing = await db.select().from(pilotProfiles).limit(1);
  if (existing.length > 0) {
    console.log("Pilot Profile already exists, skipping.");
    return;
  }
  const [profile] = await db.insert(pilotProfiles).values({ rank: 1 }).returning();
  console.log("Seeded Pilot Profile:", profile);
}

async function main() {
  await seedPilotProfile();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
