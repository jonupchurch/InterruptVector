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

const FORBIDDEN_GLOBALS = ["fetch", "require", "process", "XMLHttpRequest", "WebSocket", "Deno", "Bun", "importScripts"];

describe("adversarial: forbidden API access", () => {
  it.each(FORBIDDEN_GLOBALS)("%s is not reachable from inside the sandbox", async (globalName) => {
    const self = makeTank("self");
    const opponent = makeTank("opponent");
    const terrain = generateTerrainGrid(`adversarial-forbidden-${globalName}`, 100);

    const sandbox = await createSandbox(
      `function pilotCode(api) { if (typeof ${globalName} !== "undefined") { throw new Error("${globalName} should not exist"); } }`,
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

  it("pilot code cannot escape via constructor chains to reach a Function that runs outside the sandbox", async () => {
    const self = makeTank("self");
    const opponent = makeTank("opponent");
    const terrain = generateTerrainGrid("adversarial-constructor-escape", 100);

    // A classic sandbox-escape attempt pattern: reach the host's global
    // via a constructor chain. Inside QuickJS this still only ever
    // reaches the QuickJS realm's own globalThis, not Node's.
    const sandbox = await createSandbox(`
      function pilotCode(api) {
        const g = (function () { return this; }).constructor("return globalThis")();
        if (typeof g.fetch !== "undefined" || typeof g.require !== "undefined") {
          throw new Error("escaped to host globals");
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

    const result = sandbox.callPilotCode(apiHandle);
    expect(result.kind).toBe("ok");

    apiHandle.dispose();
    sandbox.dispose();
  });
});
