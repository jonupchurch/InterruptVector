import { describe, expect, it } from "vitest";
import { createSandbox } from "@/engine/sandbox/interpreter";
import { installApi } from "@/engine/sandbox/api-bindings";
import { chassisByTier, mobilityByTier, powerPlantByTier, sensorByTier, weaponByTier } from "@/lib/parts-catalog";
import { createTankRuntimeState } from "@/engine/tank-state";
import { generateTerrainGrid } from "@/engine/terrain";

function makeTank(id: string) {
  return createTankRuntimeState(
    id,
    { chassis: chassisByTier(1), weapon: weaponByTier(1), sensor: sensorByTier(1), mobility: mobilityByTier(1), power: powerPlantByTier(1) },
    { x: 10, y: 10 },
  );
}

describe("adversarial: memory exhaustion containment", () => {
  it("an unbounded array-growth attempt is contained by the memory limit, not left to exhaust host memory", async () => {
    const self = makeTank("self");
    const opponent = makeTank("opponent");
    const terrain = generateTerrainGrid("adversarial-memory", 100);

    const sandbox = await createSandbox(
      `function pilotCode(api) { const hog = []; while (true) { hog.push(new Array(1000).fill("x")); } }`,
      { memoryLimitBytes: 2 * 1024 * 1024, stepBudget: 50_000_000 },
    );
    const apiHandle = installApi(sandbox.context, {
      self,
      opponent,
      terrain,
      currentTick: () => 1,
      onLog: () => {},
      logCountThisTick: { value: 0 },
    });

    // Must not throw out of this call, and must not hang -- the guard
    // (step budget as a backstop, memory limit as the primary trigger
    // for this pattern) has to actually stop it.
    const result = sandbox.callPilotCode(apiHandle);
    expect(["error", "runaway"]).toContain(result.kind);

    apiHandle.dispose();
    sandbox.dispose();
  }, 15000);
});
