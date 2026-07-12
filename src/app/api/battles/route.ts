import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { battles, opponents, pilotCodePrograms, tankBuilds } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";
import { scheduleAfterResponse } from "@/lib/schedule-after-response";
import { runQueuedBattle } from "@/engine/worker";

const submitBattleSchema = z.object({
  buildId: z.number().int(),
  programId: z.number().int(),
  opponentId: z.number().int(),
});

export async function GET() {
  const profile = await getCurrentPilotProfile();
  const history = await db.select().from(battles).where(eq(battles.pilotProfileId, profile.id));
  return NextResponse.json(history);
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = submitBattleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }

  const profile = await getCurrentPilotProfile();

  const [build] = await db
    .select()
    .from(tankBuilds)
    .where(eq(tankBuilds.id, parsed.data.buildId))
    .limit(1);
  if (!build || build.pilotProfileId !== profile.id) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  const [program] = await db
    .select()
    .from(pilotCodePrograms)
    .where(eq(pilotCodePrograms.id, parsed.data.programId))
    .limit(1);
  if (!program || program.pilotProfileId !== profile.id) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const [opponent] = await db.select().from(opponents).where(eq(opponents.id, parsed.data.opponentId)).limit(1);
  if (!opponent) {
    return NextResponse.json({ error: "Opponent not found" }, { status: 404 });
  }
  if (opponent.rankTier > profile.rank) {
    return NextResponse.json({ error: "Opponent not yet unlocked at your current rank" }, { status: 400 });
  }

  const [battle] = await db
    .insert(battles)
    .values({
      pilotProfileId: profile.id,
      opponentId: opponent.id,
      buildSnapshot: {
        chassisTier: build.chassisTier,
        weaponTier: build.weaponTier,
        sensorTier: build.sensorTier,
        mobilityTier: build.mobilityTier,
        powerTier: build.powerTier,
      },
      programSourceSnapshot: program.sourceCode,
      seed: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: "queued",
    })
    .returning();

  // Matches are queued and simulated as server resources allow (spec
  // FR-017), not inline in this request. scheduleAfterResponse uses
  // Next.js's after() -- the documented mechanism for exactly this --
  // to keep the function alive to finish the work once the response
  // is sent, unlike a bare fire-and-forget promise, which platforms
  // (including the dev server) aren't obligated to let finish. See
  // src/engine/worker.ts for the remaining caveat: this still isn't a
  // durable queue that survives a server restart.
  scheduleAfterResponse(() =>
    runQueuedBattle(battle.id).catch((err) => {
      console.error(`Battle ${battle.id} failed to simulate:`, err);
    }),
  );

  return NextResponse.json({ battleId: battle.id, status: battle.status }, { status: 201 });
}
