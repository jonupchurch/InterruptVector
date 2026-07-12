import { desc, eq } from "drizzle-orm";
import { BuilderForm } from "@/components/builder/BuilderForm";
import { db } from "@/db";
import { tankBuilds } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

export default async function BuilderPage() {
  const profile = await getCurrentPilotProfile();
  const builds = await db
    .select()
    .from(tankBuilds)
    .where(eq(tankBuilds.pilotProfileId, profile.id))
    .orderBy(desc(tankBuilds.updatedAt));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-text">
        The Bay
      </h1>
      <BuilderForm rank={profile.rank} builds={builds} />
    </div>
  );
}
