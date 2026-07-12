import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pilotProfiles } from "@/db/schema";

/**
 * Rank advances only on a win against a `boss` opponent at exactly the
 * player's current rank tier (spec FR-024). Re-defeating an
 * already-cleared boss does not advance rank again (FR-028) --
 * enforced naturally here since a boss below the player's current
 * rank will never match `rankTier === profile.rank`.
 */
export async function maybeAdvanceRank(
  pilotProfileId: number,
  outcome: "win" | "loss",
  opponent: { kind: "boss" | "challenger"; rankTier: number },
): Promise<void> {
  if (outcome !== "win" || opponent.kind !== "boss") return;

  const [profile] = await db.select().from(pilotProfiles).where(eq(pilotProfiles.id, pilotProfileId)).limit(1);
  if (!profile || opponent.rankTier !== profile.rank) return;

  await db
    .update(pilotProfiles)
    .set({ rank: profile.rank + 1 })
    .where(eq(pilotProfiles.id, pilotProfileId));
}
