import { createRng } from "./rng";

/** Seven terrain types (wiki 3.0-Battlefield). Mountain is impassable and blocks both sensing and firing. */
export const TERRAIN_TYPES = [
  "concrete",
  "grass",
  "hills",
  "swamp",
  "shallow_water",
  "deep_water",
  "mountain",
] as const;
export type TerrainType = (typeof TERRAIN_TYPES)[number];

export const TERRAIN_MULTIPLIER: Record<TerrainType, number> = {
  concrete: 1.0,
  grass: 0.9,
  hills: 0.7,
  swamp: 0.5,
  shallow_water: 0.5,
  deep_water: 0.3,
  mountain: 0, // impassable -- sentinel, not a real speed multiplier
};

export const GRID_SIZE = 100;

export type TerrainGrid = TerrainType[][];

/**
 * Generates a mirrored map: terrain is only randomly chosen for cells
 * on or above the lower-left/upper-right diagonal (x <= y), then
 * reflected (swap x/y) onto the rest of the grid, so neither
 * combatant's spawn corner can get an inherent terrain advantage
 * (spec FR-022). Deterministic for a given seed (Principle V).
 */
export function generateTerrainGrid(seed: string, size: number = GRID_SIZE): TerrainGrid {
  const rng = createRng(seed);
  const grid: TerrainType[][] = Array.from({ length: size }, () => new Array<TerrainType>(size));

  for (let x = 0; x < size; x++) {
    for (let y = x; y < size; y++) {
      grid[x][y] = pickTerrain(rng());
    }
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < x; y++) {
      grid[x][y] = grid[y][x];
    }
  }
  return grid;
}

function pickTerrain(roll: number): TerrainType {
  // Weighted toward passable, common terrain -- Mountain and deep
  // water are meant to be notable features, not the majority of the
  // map. Exact weighting is a balance/tuning detail, not a design
  // commitment; these numbers can move without changing the shape of
  // the system.
  const weights: [TerrainType, number][] = [
    ["concrete", 0.3],
    ["grass", 0.25],
    ["hills", 0.15],
    ["swamp", 0.1],
    ["shallow_water", 0.1],
    ["deep_water", 0.05],
    ["mountain", 0.05],
  ];
  let cumulative = 0;
  for (const [type, weight] of weights) {
    cumulative += weight;
    if (roll < cumulative) return type;
  }
  return "concrete";
}

export function isPassable(terrain: TerrainType): boolean {
  return terrain !== "mountain";
}

export function blocksLineOfSight(terrain: TerrainType): boolean {
  return terrain === "mountain";
}
