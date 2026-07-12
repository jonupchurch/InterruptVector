import { eq } from "drizzle-orm";
import { Panel } from "@/components/ui/Panel";
import { db } from "@/db";
import { battles, pilotCodePrograms, tankBuilds } from "@/db/schema";
import { unlockedTiersForRank } from "@/lib/unlocks";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

export default async function ProfilePage() {
  const profile = await getCurrentPilotProfile();
  const [builds, programs, history] = await Promise.all([
    db.select().from(tankBuilds).where(eq(tankBuilds.pilotProfileId, profile.id)),
    db.select().from(pilotCodePrograms).where(eq(pilotCodePrograms.pilotProfileId, profile.id)),
    db.select().from(battles).where(eq(battles.pilotProfileId, profile.id)),
  ]);

  const completed = history.filter((b) => b.status === "complete");
  const wins = completed.filter((b) => b.outcome === "win").length;
  const losses = completed.filter((b) => b.outcome === "loss").length;
  const winRate = completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0;
  const unlocked = unlockedTiersForRank(profile.rank);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-text">
        Pilot Profile
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Rank">
          <div className="flex flex-col gap-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-text-dim">Current</span>
              <span className="text-cyan text-lg">{profile.rank} / 10</span>
            </div>
            <div className="mt-2 border-t border-line pt-2 text-text-mid">Unlocked tiers</div>
            <div className="flex justify-between">
              <span className="text-text-dim">Chassis / Weapon</span>
              <span className="text-text">T{unlocked.chassis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Sensors / Mobility / Power</span>
              <span className="text-text">T{unlocked.sensor}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Record">
          <div className="flex flex-col gap-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-text-dim">Win Rate</span>
              <span className="text-green">{winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Wins</span>
              <span className="text-text">{wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Losses</span>
              <span className="text-text">{losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Total Battles</span>
              <span className="text-text">{history.length}</span>
            </div>
          </div>
        </Panel>

        <Panel title="The Bay">
          <span className="font-mono text-sm text-text-mid">
            {builds.length} saved build{builds.length === 1 ? "" : "s"}
          </span>
        </Panel>

        <Panel title="The Socket">
          <span className="font-mono text-sm text-text-mid">
            {programs.length} saved program{programs.length === 1 ? "" : "s"}
          </span>
        </Panel>
      </div>
    </div>
  );
}
