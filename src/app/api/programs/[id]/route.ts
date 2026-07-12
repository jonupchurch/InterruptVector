import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { pilotCodePrograms } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";
import { programInputSchema } from "@/lib/program-schema";
import { checkPilotCodeSyntax } from "@/lib/syntax-check";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const programId = Number(id);
  if (!Number.isInteger(programId)) {
    return NextResponse.json({ error: "Invalid program id" }, { status: 400 });
  }

  const json = await request.json();
  const parsed = programInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }

  const syntaxResult = checkPilotCodeSyntax(parsed.data.sourceCode);
  if (!syntaxResult.valid) {
    return NextResponse.json(
      { errors: [{ field: "sourceCode", message: syntaxResult.message }] },
      { status: 400 },
    );
  }

  const profile = await getCurrentPilotProfile();
  const [updated] = await db
    .update(pilotCodePrograms)
    .set({ name: parsed.data.name, sourceCode: parsed.data.sourceCode, updatedAt: new Date() })
    .where(and(eq(pilotCodePrograms.id, programId), eq(pilotCodePrograms.pilotProfileId, profile.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
