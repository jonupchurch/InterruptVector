import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { battles } from "@/db/schema";
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

  return NextResponse.json(battle);
}
