import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReplayViewer } from "@/components/replay/ReplayViewer";
import { db } from "@/db";
import { battleLogs, battles } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";
import type { TickLog } from "@/engine/replay-log";

export default async function ReplayPage({ params }: { params: Promise<{ battleId: string }> }) {
  const { battleId } = await params;
  const id = Number(battleId);
  if (!Number.isInteger(id)) notFound();

  const profile = await getCurrentPilotProfile();
  const [battle] = await db.select().from(battles).where(eq(battles.id, id)).limit(1);
  if (!battle || battle.pilotProfileId !== profile.id) notFound();

  if (battle.status !== "complete") {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-text">Replay</h1>
        <p className="font-mono text-sm text-text-mid">
          Battle #{battle.id} is {battle.status}
          {battle.status === "failed" && battle.errorMessage ? `: ${battle.errorMessage}` : "."}
        </p>
      </div>
    );
  }

  const [log] = await db.select().from(battleLogs).where(eq(battleLogs.battleId, id)).limit(1);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-text">
        Replay — Battle #{battle.id}
      </h1>
      <ReplayViewer
        outcome={battle.outcome}
        finalTick={battle.finalTick}
        tickLog={(log?.tickLog as TickLog | undefined) ?? []}
      />
    </div>
  );
}
