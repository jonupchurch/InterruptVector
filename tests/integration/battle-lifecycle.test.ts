import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { POST as postBuilds } from "@/app/api/builds/route";
import { POST as postPrograms } from "@/app/api/programs/route";
import { POST as postBattles } from "@/app/api/battles/route";
import { GET as getBattle } from "@/app/api/battles/[id]/route";
import { db } from "@/db";
import { opponents } from "@/db/schema";

function post(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

async function waitForCompletion(battleId: number, timeoutMs = 15000) {
  const start = Date.now();
  for (;;) {
    const res = await getBattle(new Request(`http://localhost/api/battles/${battleId}`), {
      params: Promise.resolve({ id: String(battleId) }),
    });
    const battle = await res.json();
    if (battle.status === "complete") return battle;
    if (Date.now() - start > timeoutMs) throw new Error("Battle did not complete in time");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

describe("full battle lifecycle: queued submission -> simulate -> complete", () => {
  it("submits a battle and it eventually completes with a win/loss outcome and advances rank on a boss win", async () => {
    const buildRes = await postBuilds(
      post("http://localhost/api/builds", {
        name: "Lifecycle Test Tank",
        chassisTier: 1,
        weaponTier: 1,
        sensorTier: 1,
        mobilityTier: 1,
        powerTier: 1,
      }),
    );
    expect(buildRes.status).toBe(201);
    const build = await buildRes.json();

    const programRes = await postPrograms(
      post("http://localhost/api/programs", {
        name: "Lifecycle Test Program",
        sourceCode: `
          function pilotCode(api) {
            const bogeys = api.sensors();
            if (bogeys !== -1 && bogeys.length > 0) {
              api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
              api.fire();
            }
            api.moveForward();
          }
        `,
      }),
    );
    expect(programRes.status).toBe(201);
    const program = await programRes.json();

    const [challenger] = await db.select().from(opponents).where(eq(opponents.rankTier, 1)).limit(1);
    expect(challenger).toBeDefined();

    const battleRes = await postBattles(
      post("http://localhost/api/battles", {
        buildId: build.id,
        programId: program.id,
        opponentId: challenger.id,
      }),
    );
    expect(battleRes.status).toBe(201);
    const { battleId, status } = await battleRes.json();
    expect(status).toBe("queued");

    const completed = await waitForCompletion(battleId);
    expect(["win", "loss"]).toContain(completed.outcome);
    expect(completed.finalTick).toBeGreaterThan(0);
  }, 20000);
});
