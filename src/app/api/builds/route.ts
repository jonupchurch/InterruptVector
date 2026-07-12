import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tankBuilds } from "@/db/schema";
import { buildInputSchema } from "@/lib/build-schema";
import { validateBuild } from "@/lib/build-validation";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

export async function GET() {
  const profile = await getCurrentPilotProfile();
  const builds = await db.select().from(tankBuilds).where(eq(tankBuilds.pilotProfileId, profile.id));
  return NextResponse.json(builds);
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = buildInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }

  const profile = await getCurrentPilotProfile();
  const validationErrors = validateBuild(profile.rank, parsed.data);
  if (validationErrors.length > 0) {
    return NextResponse.json({ errors: validationErrors }, { status: 400 });
  }

  const [build] = await db
    .insert(tankBuilds)
    .values({
      pilotProfileId: profile.id,
      name: parsed.data.name,
      chassisTier: parsed.data.chassisTier,
      weaponTier: parsed.data.weaponTier,
      sensorTier: parsed.data.sensorTier,
      mobilityTier: parsed.data.mobilityTier,
      powerTier: parsed.data.powerTier,
    })
    .returning();

  return NextResponse.json(build, { status: 201 });
}
