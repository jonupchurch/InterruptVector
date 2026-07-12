import { db } from "@/db";
import { pilotProfiles } from "@/db/schema";

/**
 * Single-owner/no-login for v1 (spec Assumptions) -- there is exactly
 * one seeded Pilot Profile row (see scripts/seed.ts). This helper is
 * the one place that assumption lives, so swapping in real auth later
 * only means changing this function's implementation.
 */
export async function getCurrentPilotProfile() {
  const [profile] = await db.select().from(pilotProfiles).limit(1);
  if (!profile) {
    throw new Error("No Pilot Profile found -- run `npm run db:seed`.");
  }
  return profile;
}
