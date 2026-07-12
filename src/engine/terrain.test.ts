import { describe, expect, it } from "vitest";
import { blocksLineOfSight, generateTerrainGrid, GRID_SIZE, isPassable, TERRAIN_MULTIPLIER } from "./terrain";

describe("generateTerrainGrid", () => {
  it("is deterministic for a given seed", () => {
    const a = generateTerrainGrid("map-seed-1", 20);
    const b = generateTerrainGrid("map-seed-1", 20);
    expect(a).toEqual(b);
  });

  it("mirrors terrain across the lower-left/upper-right diagonal", () => {
    const grid = generateTerrainGrid("mirror-check", 20);
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        expect(grid[x][y]).toBe(grid[y][x]);
      }
    }
  });

  it("produces a full-size grid by default", () => {
    const grid = generateTerrainGrid("full-size");
    expect(grid.length).toBe(GRID_SIZE);
    expect(grid[0].length).toBe(GRID_SIZE);
  });
});

describe("terrain passability and line-of-sight", () => {
  it("treats Mountain as impassable and LoS-blocking, everything else as not", () => {
    expect(isPassable("mountain")).toBe(false);
    expect(blocksLineOfSight("mountain")).toBe(true);
    for (const terrain of ["concrete", "grass", "hills", "swamp", "shallow_water", "deep_water"] as const) {
      expect(isPassable(terrain)).toBe(true);
      expect(blocksLineOfSight(terrain)).toBe(false);
    }
  });

  it("Mountain has a 0 multiplier sentinel, every other terrain has a positive one", () => {
    expect(TERRAIN_MULTIPLIER.mountain).toBe(0);
    expect(TERRAIN_MULTIPLIER.concrete).toBeGreaterThan(0);
    expect(TERRAIN_MULTIPLIER.deep_water).toBeGreaterThan(0);
  });
});
