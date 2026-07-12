import { eq, lte } from "drizzle-orm";
import { BattleSubmitForm } from "@/components/battles/BattleSubmitForm";
import { BattleHistory } from "@/components/battles/BattleHistory";
import { db } from "@/db";
import { battles, opponents, pilotCodePrograms, tankBuilds } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

export default async function BattlesPage() {
  const profile = await getCurrentPilotProfile();
  const [builds, programs, allOpponents, history] = await Promise.all([
    db.select().from(tankBuilds).where(eq(tankBuilds.pilotProfileId, profile.id)),
    db.select().from(pilotCodePrograms).where(eq(pilotCodePrograms.pilotProfileId, profile.id)),
    db.select().from(opponents).where(lte(opponents.rankTier, profile.rank)),
    db.select().from(battles).where(eq(battles.pilotProfileId, profile.id)),
  ]);

  const available = allOpponents.filter((o) => o.kind === "challenger" || o.rankTier === profile.rank);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-text">
        Battles
      </h1>
      {builds.length === 0 || programs.length === 0 ? (
        <p className="font-mono text-sm text-text-mid">
          You need at least one saved build (The Bay) and one saved program (The Socket) before you can fight.
        </p>
      ) : (
        <BattleSubmitForm builds={builds} programs={programs} opponents={available} />
      )}
      <div className="mt-6">
        <BattleHistory battles={history} />
      </div>
    </div>
  );
}
