import { describe, expect, it } from "vitest";
import { chassisByTier, mobilityByTier, powerPlantByTier, sensorByTier, weaponByTier } from "@/lib/parts-catalog";
import { advanceTankQueues, installApi } from "@/engine/sandbox/api-bindings";
import { createSandbox } from "@/engine/sandbox/interpreter";
import { createTankRuntimeState } from "@/engine/tank-state";
import { generateTerrainGrid } from "@/engine/terrain";

function makeTank(id: string, position: { x: number; y: number }) {
  return createTankRuntimeState(
    id,
    {
      chassis: chassisByTier(1),
      weapon: weaponByTier(1),
      sensor: sensorByTier(1),
      mobility: mobilityByTier(1),
      power: powerPlantByTier(1),
    },
    position,
  );
}

describe("engine <-> sandbox boundary", () => {
  it("lets pilot code call api.log() and have it recorded", async () => {
    const self = makeTank("self", { x: 10, y: 10 });
    const opponent = makeTank("opponent", { x: 90, y: 90 });
    const terrain = generateTerrainGrid("engine-sandbox-log-test", 100);
    const logs: { message: string }[] = [];

    const sandbox = await createSandbox(`function pilotCode(api) { api.log("hello from pilot code"); }`);
    const apiHandle = installApi(sandbox.context, {
      self,
      opponent,
      terrain,
      currentTick: () => 1,
      onLog: (entry) => logs.push(entry),
      logCountThisTick: { value: 0 },
    });

    const result = sandbox.callPilotCode(apiHandle);
    expect(result.kind).toBe("ok");
    expect(logs).toEqual([{ tick: 1, tankId: "self", source: "pilot", message: "hello from pilot code" }]);

    apiHandle.dispose();
    sandbox.dispose();
  });

  it("lets pilot code read self() and call fire(), actually damaging the opponent when aimed and in range", async () => {
    const self = makeTank("self", { x: 10, y: 10 });
    const opponent = makeTank("opponent", { x: 10, y: 15 }); // due North, within tier-1 sensor range (30)
    const terrain = generateTerrainGrid("engine-sandbox-fire-test", 100);

    const sandbox = await createSandbox(`
      function pilotCode(api) {
        const status = api.self();
        if (status.hp > 0) {
          api.fire();
        }
      }
    `);
    const apiHandle = installApi(sandbox.context, {
      self,
      opponent,
      terrain,
      currentTick: () => 1,
      onLog: () => {},
      logCountThisTick: { value: 0 },
    });

    const hpBefore = opponent.hp;
    const result = sandbox.callPilotCode(apiHandle);
    if (result.kind === "error") console.error("Sandbox error:", result.message);
    expect(result.kind).toBe("ok");
    // self starts facing North (headingIndex 0) with turret at bearing 0 (North) by default,
    // and the opponent is due North -- default aim should be a hit.
    expect(opponent.hp).toBeLessThan(hpBefore);

    apiHandle.dispose();
    sandbox.dispose();
  });

  it("propagates a thrown pilot-code exception as an error result without crashing the host", async () => {
    const self = makeTank("self", { x: 10, y: 10 });
    const opponent = makeTank("opponent", { x: 90, y: 90 });
    const terrain = generateTerrainGrid("engine-sandbox-error-test", 100);

    const sandbox = await createSandbox(`function pilotCode(api) { throw new Error("boom"); }`);
    const apiHandle = installApi(sandbox.context, {
      self,
      opponent,
      terrain,
      currentTick: () => 1,
      onLog: () => {},
      logCountThisTick: { value: 0 },
    });

    const result = sandbox.callPilotCode(apiHandle);
    expect(result.kind).toBe("error");

    apiHandle.dispose();
    sandbox.dispose();
  });

  it("has no network or filesystem access available inside the sandbox", async () => {
    const self = makeTank("self", { x: 10, y: 10 });
    const opponent = makeTank("opponent", { x: 90, y: 90 });
    const terrain = generateTerrainGrid("engine-sandbox-isolation-test", 100);

    const sandbox = await createSandbox(`
      function pilotCode(api) {
        if (typeof fetch !== "undefined") throw new Error("fetch should not exist");
        if (typeof require !== "undefined") throw new Error("require should not exist");
        if (typeof process !== "undefined") throw new Error("process should not exist");
      }
    `);
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

  it("advanceTankQueues applies a completed hull turn to headingIndex", () => {
    const self = makeTank("self", { x: 10, y: 10 });
    const opponent = makeTank("opponent", { x: 90, y: 90 });
    const terrain = generateTerrainGrid("engine-sandbox-turn-test", 100);

    self.turnQueue = { current: { action: { headingIndex: 2 }, ticksRequired: 1 }, ticksRemaining: 1, queued: null };
    advanceTankQueues(self, opponent, terrain);
    expect(self.headingIndex).toBe(2);
  });
});
