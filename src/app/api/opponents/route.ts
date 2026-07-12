import { eq, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { opponents } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

/** Opponents available to fight: this rank's mandatory boss, plus every already-unlocked tier's challengers. */
export async function GET() {
  const profile = await getCurrentPilotProfile();
  const bosses = await db.select().from(opponents).where(eq(opponents.rankTier, profile.rank));
  const challengers = await db
    .select()
    .from(opponents)
    .where(lte(opponents.rankTier, profile.rank));

  const available = [
    ...bosses.filter((o) => o.kind === "boss"),
    ...challengers.filter((o) => o.kind === "challenger"),
  ];
  return NextResponse.json(available);
}
