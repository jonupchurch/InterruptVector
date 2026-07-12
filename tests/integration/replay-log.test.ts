import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { POST as postBuilds } from "@/app/api/builds/route";
import { POST as postPrograms } from "@/app/api/programs/route";
import { POST as postBattles } from "@/app/api/battles/route";
import { GET as getBattle } from "@/app/api/battles/[id]/route";
import { GET as getBattleLog } from "@/app/api/battles/[id]/log/route";
import { db } from "@/db";
import { battles, opponents } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

function post(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function fetchLog(battleId: number) {
  return getBattleLog(new Request(`http://localhost/api/battles/${battleId}/log`), {
    params: Promise.resolve({ id: String(battleId) }),
  });
}

async function waitForCompletion(battleId: number, timeoutMs = 15000) {
  const start = Date.now();
  for (;;) {
    const res = await getBattle(new Request(`http://localhost/api/battles/${battleId}`), {
      params: Promise.resolve({ id: String(battleId) }),
    });
    const battle = await res.json();
    if (battle.status === "complete" || battle.status === "failed") return battle;
    if (Date.now() - start > timeoutMs) throw new Error("Battle did not resolve in time");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

describe("GET /api/battles/:id/log", () => {
  it("returns 409 for a battle that hasn't completed yet", async () => {
    const profile = await getCurrentPilotProfile();
    const [challenger] = await db.select().from(opponents).where(eq(opponents.rankTier, 1)).limit(1);

    // Insert a still-queued battle directly, bypassing the worker, so
    // this assertion isn't racing real (now sub-second) simulation.
    const [queuedBattle] = await db
      .insert(battles)
      .values({
        pilotProfileId: profile.id,
        opponentId: challenger.id,
        buildSnapshot: { chassisTier: 1, weaponTier: 1, sensorTier: 1, mobilityTier: 1, powerTier: 1 },
        programSourceSnapshot: "function pilotCode(api) {}",
        seed: "replay-log-queued-test",
        status: "queued",
      })
      .returning();

    const res = await fetchLog(queuedBattle.id);
    expect(res.status).toBe(409);
  });

  it("exposes the tick log once a battle actually completes", async () => {
    const buildRes = await postBuilds(
      post("http://localhost/api/builds", {
        name: "Replay Log Test Tank",
        chassisTier: 1,
        weaponTier: 1,
        sensorTier: 1,
        mobilityTier: 1,
        powerTier: 1,
      }),
    );
    const build = await buildRes.json();

    const programRes = await postPrograms(
      post("http://localhost/api/programs", {
        name: "Replay Log Test Program",
        sourceCode: `
          function pilotCode(api) {
            const bogeys = api.sensors();
            if (bogeys !== -1 && bogeys.length > 0) {
              api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
              api.fire();
            }
            api.moveForward();
            api.log("ticking");
          }
        `,
      }),
    );
    const program = await programRes.json();

    const [challenger] = await db.select().from(opponents).where(eq(opponents.rankTier, 1)).limit(1);

    const battleRes = await postBattles(
      post("http://localhost/api/battles", { buildId: build.id, programId: program.id, opponentId: challenger.id }),
    );
    const { battleId } = await battleRes.json();

    const completed = await waitForCompletion(battleId);
    expect(completed.status).toBe("complete");

    const logRes = await fetchLog(battleId);
    expect(logRes.status).toBe(200);
    const logBody = await logRes.json();
    expect(Array.isArray(logBody.tickLog)).toBe(true);
    expect(logBody.tickLog.length).toBeGreaterThan(0);
    expect(logBody.tickLog[0]).toHaveProperty("tanks");
    expect(logBody.tickLog[0]).toHaveProperty("logs");
  }, 20000);
});
