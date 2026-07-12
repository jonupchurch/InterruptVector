import { describe, expect, it } from "vitest";
import { chassisByTier, mobilityByTier, powerPlantByTier, sensorByTier, weaponByTier } from "@/lib/parts-catalog";
import { simulateBattle } from "@/engine/simulate";

const AGGRESSIVE_PILOT = `
  function pilotCode(api) {
    const bogeys = api.sensors();
    if (bogeys !== -1 && bogeys.length > 0) {
      api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
      api.fire();
    }
    api.moveForward();
  }
`;

function tier1Parts() {
  return {
    chassis: chassisByTier(1),
    weapon: weaponByTier(1),
    sensor: sensorByTier(1),
    mobility: mobilityByTier(1),
    power: powerPlantByTier(1),
  };
}

describe("simulateBattle determinism", () => {
  it("produces a byte-identical tick log for the same build + code + seed across repeated runs", async () => {
    const params = {
      playerParts: tier1Parts(),
      playerSourceCode: AGGRESSIVE_PILOT,
      opponentParts: tier1Parts(),
      opponentSourceCode: AGGRESSIVE_PILOT,
      seed: "determinism-check-seed",
      maxTicks: 200,
    };

    const first = await simulateBattle(params);
    const second = await simulateBattle(params);

    expect(second.outcome).toBe(first.outcome);
    expect(second.finalTick).toBe(first.finalTick);
    expect(JSON.stringify(second.tickLog)).toBe(JSON.stringify(first.tickLog));
  }, 30000);

  it("produces a different tick log for a different seed (map/RNG actually varies)", async () => {
    const base = {
      playerParts: tier1Parts(),
      playerSourceCode: AGGRESSIVE_PILOT,
      opponentParts: tier1Parts(),
      opponentSourceCode: AGGRESSIVE_PILOT,
      maxTicks: 50,
    };
    const a = await simulateBattle({ ...base, seed: "seed-a" });
    const b = await simulateBattle({ ...base, seed: "seed-b" });
    expect(JSON.stringify(a.tickLog)).not.toBe(JSON.stringify(b.tickLog));
  }, 30000);
});
