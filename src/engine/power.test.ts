import { describe, expect, it } from "vitest";
import { attemptSensorsReservesCharge, createPowerState, tickPowerBalance } from "./power";

describe("attemptSensorsReservesCharge", () => {
  it("deducts 1 Reserves when affordable", () => {
    const state = createPowerState(10, 20);
    const { success, state: next } = attemptSensorsReservesCharge(state);
    expect(success).toBe(true);
    expect(next.reserves).toBe(19);
  });

  it("fails without deducting when Reserves is empty", () => {
    const state = { ...createPowerState(10, 20), reserves: 0 };
    const { success, state: next } = attemptSensorsReservesCharge(state);
    expect(success).toBe(false);
    expect(next.reserves).toBe(0);
  });

  it("does not force overload by itself", () => {
    const state = { ...createPowerState(10, 20), reserves: 0 };
    const { state: next } = attemptSensorsReservesCharge(state);
    expect(next.overloaded).toBe(false);
  });
});

describe("tickPowerBalance", () => {
  it("recharges Reserves on an underdraw tick, capped at max", () => {
    const state = { ...createPowerState(10, 20), reserves: 15 };
    const next = tickPowerBalance(state, 4); // draw 4, output 10, surplus 6
    expect(next.reserves).toBe(20); // capped, not 21
  });

  it("draws down Reserves on an overdraw tick that Reserves can cover", () => {
    const state = createPowerState(10, 20); // reserves starts at max (20)
    const next = tickPowerBalance(state, 15); // overdraw by 5
    expect(next.reserves).toBe(15);
    expect(next.overloaded).toBe(false);
  });

  it("triggers overload when Reserves can't cover the overdraw", () => {
    const state = { ...createPowerState(10, 20), reserves: 3 };
    const next = tickPowerBalance(state, 20); // overdraw by 10, only 3 reserves available
    expect(next.overloaded).toBe(true);
    expect(next.reserves).toBe(0);
  });

  it("stays silent and recovers only once Reserves refills to max, not just above zero", () => {
    let state = { ...createPowerState(10, 20), overloaded: true, reserves: 0 };
    state = tickPowerBalance(state, 999); // draw is irrelevant while overloaded -- forced to 0
    expect(state.reserves).toBe(10);
    expect(state.overloaded).toBe(true); // not yet full
    state = tickPowerBalance(state, 999);
    expect(state.reserves).toBe(20);
    expect(state.overloaded).toBe(false); // now fully recovered
  });
});
