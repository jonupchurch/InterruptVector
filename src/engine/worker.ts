import { eq } from "drizzle-orm";
import { db } from "@/db";
import { battleLogs, battles, opponents } from "@/db/schema";
import { chassisByTier, mobilityByTier, powerPlantByTier, sensorByTier, weaponByTier } from "@/lib/parts-catalog";
import { maybeAdvanceRank } from "./progression";
import { simulateBattle } from "./simulate";
import type { BuildTierSelection } from "@/lib/unlocks";

function partsFromTiers(selection: BuildTierSelection) {
  return {
    chassis: chassisByTier(selection.chassisTier),
    weapon: weaponByTier(selection.weaponTier),
    sensor: sensorByTier(selection.sensorTier),
    mobility: mobilityByTier(selection.mobilityTier),
    power: powerPlantByTier(selection.powerTier),
  };
}

/**
 * Runs one queued battle to completion and persists the result.
 * Triggered via `after()` from the submission route (spec FR-017:
 * queued, not simulated inline) -- for local dev this just means
 * "kicked off after the response is sent, in the same long-running
 * process." A real deployment needs a durable queue/worker (e.g.
 * Vercel Queues) instead of relying on a serverless function staying
 * alive after its response is sent; that gap is intentionally
 * deferred until there's an actual deployment to design against (see
 * docs/future-work.md).
 *
 * Any unexpected error (a malformed saved program that somehow got
 * past save-time validation, a bug in the engine itself, etc.) marks
 * the battle `failed` rather than leaving it stuck at `simulating`
 * forever -- a battle that silently never finishes is worse than one
 * that visibly failed, and was a real bug caught by testing this
 * against a bad program fixture left over from an earlier test run.
 */
export async function runQueuedBattle(battleId: number): Promise<void> {
  const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1);
  if (!battle || battle.status !== "queued") return;

  await db.update(battles).set({ status: "simulating" }).where(eq(battles.id, battleId));

  try {
    const [opponent] = await db.select().from(opponents).where(eq(opponents.id, battle.opponentId)).limit(1);
    if (!opponent) throw new Error(`Opponent ${battle.opponentId} not found`);

    const { loadOpponentPilotCode } = await import("./opponents/registry");
    const opponentSourceCode = loadOpponentPilotCode(opponent.behaviorModule);

    const result = await simulateBattle({
      playerParts: partsFromTiers(battle.buildSnapshot as BuildTierSelection),
      playerSourceCode: battle.programSourceSnapshot,
      opponentParts: partsFromTiers({
        chassisTier: opponent.chassisTier,
        weaponTier: opponent.weaponTier,
        sensorTier: opponent.sensorTier,
        mobilityTier: opponent.mobilityTier,
        powerTier: opponent.powerTier,
      }),
      opponentSourceCode,
      seed: battle.seed,
    });

    await db
      .update(battles)
      .set({ status: "complete", outcome: result.outcome, finalTick: result.finalTick, simulatedAt: new Date() })
      .where(eq(battles.id, battleId));

    await db.insert(battleLogs).values({ battleId, tickLog: result.tickLog });

    await maybeAdvanceRank(battle.pilotProfileId, result.outcome, { kind: opponent.kind, rankTier: opponent.rankTier });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Battle ${battleId} failed to simulate:`, err);
    await db
      .update(battles)
      .set({ status: "failed", errorMessage: message, simulatedAt: new Date() })
      .where(eq(battles.id, battleId));
  }
}
