import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { battleLogs, battles } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const battleId = Number(id);
  if (!Number.isInteger(battleId)) {
    return NextResponse.json({ error: "Invalid battle id" }, { status: 400 });
  }

  const profile = await getCurrentPilotProfile();
  const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1);
  if (!battle || battle.pilotProfileId !== profile.id) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }
  if (battle.status !== "complete") {
    return NextResponse.json({ error: `Replay not available -- battle status is "${battle.status}"` }, { status: 409 });
  }

  const [log] = await db.select().from(battleLogs).where(eq(battleLogs.battleId, battleId)).limit(1);
  if (!log) {
    return NextResponse.json({ error: "Battle log not found" }, { status: 404 });
  }

  return NextResponse.json({ battleId, outcome: battle.outcome, finalTick: battle.finalTick, tickLog: log.tickLog });
}
