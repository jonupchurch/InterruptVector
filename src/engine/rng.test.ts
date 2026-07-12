import { describe, expect, it } from "vitest";
import { createRng } from "./rng";

describe("createRng", () => {
  it("produces the same sequence for the same seed (determinism)", () => {
    const a = createRng("battle-42");
    const b = createRng("battle-42");
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces a different sequence for a different seed", () => {
    const a = createRng("battle-42");
    const b = createRng("battle-43");
    expect(a()).not.toBe(b());
  });

  it("stays within [0, 1)", () => {
    const rng = createRng("range-check");
    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
