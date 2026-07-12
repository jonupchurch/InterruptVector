import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { pilotCodePrograms } from "@/db/schema";
import { programInputSchema } from "@/lib/program-schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";
import { checkPilotCodeSyntax } from "@/lib/syntax-check";
import { verifyPilotCodeIsDefined } from "@/engine/sandbox/interpreter";

export async function GET() {
  const profile = await getCurrentPilotProfile();
  const programs = await db
    .select()
    .from(pilotCodePrograms)
    .where(eq(pilotCodePrograms.pilotProfileId, profile.id));
  return NextResponse.json(programs);
}

export async function POST(request: Request) {
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

  const definitionResult = await verifyPilotCodeIsDefined(parsed.data.sourceCode);
  if (!definitionResult.valid) {
    return NextResponse.json(
      { errors: [{ field: "sourceCode", message: definitionResult.message }] },
      { status: 400 },
    );
  }

  const profile = await getCurrentPilotProfile();
  const [program] = await db
    .insert(pilotCodePrograms)
    .values({
      pilotProfileId: profile.id,
      name: parsed.data.name,
      sourceCode: parsed.data.sourceCode,
    })
    .returning();

  return NextResponse.json(program, { status: 201 });
}
