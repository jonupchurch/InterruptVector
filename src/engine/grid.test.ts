import { describe, expect, it } from "vitest";
import {
  bearingDegrees,
  cellAhead,
  directionIndexToCode,
  distanceBetween,
  footprintSquares,
  parseDirection,
  stepsBetween,
  ticksForHullTurn,
  ticksForTurretTurn,
  turretAimCost,
} from "./grid";

describe("parseDirection", () => {
  it("parses numeric directions 1-8 to 0-7 indices", () => {
    expect(parseDirection(1)).toBe(0);
    expect(parseDirection(8)).toBe(7);
  });

  it("parses two-letter codes to matching indices", () => {
    expect(parseDirection("NN")).toBe(0);
    expect(parseDirection("EE")).toBe(2);
    expect(parseDirection("NW")).toBe(7);
  });

  it("round-trips through directionIndexToCode", () => {
    expect(directionIndexToCode(parseDirection("SW"))).toBe("SW");
  });
});

describe("stepsBetween", () => {
  it("is 0 for the same heading", () => {
    expect(stepsBetween(0, 0)).toBe(0);
  });

  it("takes the shorter path around the compass", () => {
    // WW (index 6) to EE (index 2): 4 steps either way (the symmetric case)
    expect(stepsBetween(6, 2)).toBe(4);
    // NN (0) to NE (1): 1 step
    expect(stepsBetween(0, 1)).toBe(1);
    // NN (0) to NW (7): 1 step the other way around
    expect(stepsBetween(0, 7)).toBe(1);
  });
});

describe("footprintSquares", () => {
  it("matches the wiki's worked table", () => {
    expect(footprintSquares(1)).toBe(1);
    expect(footprintSquares(2)).toBe(1);
    expect(footprintSquares(3)).toBe(2);
    expect(footprintSquares(9)).toBe(5);
    expect(footprintSquares(10)).toBe(5);
  });
});

describe("ticksForHullTurn", () => {
  it("costs a full 10-tick window per turnRate's worth of steps", () => {
    expect(ticksForHullTurn(1, 1)).toBe(10);
    expect(ticksForHullTurn(5, 5)).toBe(10);
    expect(ticksForHullTurn(6, 5)).toBe(20); // spills into a second window
  });

  it("costs nothing for zero steps", () => {
    expect(ticksForHullTurn(0, 3)).toBe(0);
  });
});

describe("ticksForTurretTurn", () => {
  it("is a flat 5 ticks per step regardless of tier", () => {
    expect(ticksForTurretTurn(3)).toBe(15);
  });
});

describe("bearingDegrees + turretAimCost", () => {
  it("computes a 140-degree bearing as 15 ticks plus a 5-degree free remainder (wiki worked example)", () => {
    // Directly construct a point at 140 degrees clockwise from North (+Y).
    const rad = (140 * Math.PI) / 180;
    const to = { x: Math.sin(rad) * 100, y: Math.cos(rad) * 100 };
    const bearing = bearingDegrees({ x: 0, y: 0 }, to);
    expect(bearing).toBeCloseTo(140, 5);

    const cost = turretAimCost(bearing);
    expect(cost.steps).toBe(3);
    expect(cost.ticks).toBe(15);
    expect(cost.remainderDegrees).toBeCloseTo(5, 5);
  });
});

describe("cellAhead", () => {
  it("moves one cell in the facing direction", () => {
    expect(cellAhead({ x: 50, y: 50 }, 0, 100, true)).toEqual({ x: 50, y: 51 }); // North, forward
    expect(cellAhead({ x: 50, y: 50 }, 2, 100, true)).toEqual({ x: 51, y: 50 }); // East, forward
  });

  it("moves the opposite cell when not forward (reverse)", () => {
    expect(cellAhead({ x: 50, y: 50 }, 0, 100, false)).toEqual({ x: 50, y: 49 });
  });

  it("clamps to the grid boundary", () => {
    expect(cellAhead({ x: 0, y: 0 }, 6, 100, true)).toEqual({ x: 0, y: 0 }); // West, already at edge
    expect(cellAhead({ x: 99, y: 99 }, 2, 100, true)).toEqual({ x: 99, y: 99 }); // East, already at edge
  });
});

describe("distanceBetween", () => {
  it("computes Euclidean distance", () => {
    expect(distanceBetween({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
