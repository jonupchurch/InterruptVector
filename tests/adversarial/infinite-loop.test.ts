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

describe("adversarial: infinite loop containment", () => {
  it("an infinite while(true) loop is contained by the step-count budget, not left to hang the host", async () => {
    const self = makeTank("self");
    const opponent = makeTank("opponent");
    const terrain = generateTerrainGrid("adversarial-infinite-loop", 100);

    const sandbox = await createSandbox(`function pilotCode(api) { while (true) { } }`, { stepBudget: 10_000 });
    const apiHandle = installApi(sandbox.context, {
      self,
      opponent,
      terrain,
      currentTick: () => 1,
      onLog: () => {},
      logCountThisTick: { value: 0 },
    });

    const start = Date.now();
    const result = sandbox.callPilotCode(apiHandle);
    const elapsedMs = Date.now() - start;

    expect(result.kind).toBe("runaway");
    // Contained quickly -- this proves the interrupt handler actually
    // aborted execution rather than the call returning because the
    // loop happened to finish (it can't) or the process hanging.
    expect(elapsedMs).toBeLessThan(5000);

    apiHandle.dispose();
    sandbox.dispose();
  });

  it("a heavy but finite loop within budget completes normally", async () => {
    const self = makeTank("self");
    const opponent = makeTank("opponent");
    const terrain = generateTerrainGrid("adversarial-finite-loop", 100);

    const sandbox = await createSandbox(
      `function pilotCode(api) { let x = 0; for (let i = 0; i < 1000; i++) { x += i; } }`,
      { stepBudget: 500_000 },
    );
    const apiHandle = installApi(sandbox.context, {
      self,
      opponent,
      terrain,
      currentTick: () => 1,
      onLog: () => {},
      logCountThisTick: { value: 0 },
    });

    const result = sandbox.callPilotCode(apiHandle);
    expect(result.kind).toBe("ok");

    apiHandle.dispose();
    sandbox.dispose();
  });
});
