import { eq } from "drizzle-orm";
import { CodeEditorPage } from "@/components/code/CodeEditorPage";
import { db } from "@/db";
import { pilotCodePrograms } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

export default async function CodePage() {
  const profile = await getCurrentPilotProfile();
  const programs = await db
    .select()
    .from(pilotCodePrograms)
    .where(eq(pilotCodePrograms.pilotProfileId, profile.id));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-text">
        The Socket
      </h1>
      <CodeEditorPage initialPrograms={programs} />
    </div>
  );
}
