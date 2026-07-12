import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tankBuilds } from "@/db/schema";
import { buildInputSchema } from "@/lib/build-schema";
import { validateBuild } from "@/lib/build-validation";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const buildId = Number(id);
  if (!Number.isInteger(buildId)) {
    return NextResponse.json({ error: "Invalid build id" }, { status: 400 });
  }

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

  const [updated] = await db
    .update(tankBuilds)
    .set({
      name: parsed.data.name,
      chassisTier: parsed.data.chassisTier,
      weaponTier: parsed.data.weaponTier,
      sensorTier: parsed.data.sensorTier,
      mobilityTier: parsed.data.mobilityTier,
      powerTier: parsed.data.powerTier,
      updatedAt: new Date(),
    })
    .where(and(eq(tankBuilds.id, buildId), eq(tankBuilds.pilotProfileId, profile.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
