/**
 * Power Reserves/Output/overload resolution (wiki 1.1.5-Power, spec
 * FR-015, FR-036). Two distinct mechanisms share the same Reserves
 * pool:
 *  - The continuous per-tick draw/output balance (every equipped
 *    system's fixed power draw vs. the Power Plant's Output).
 *  - `sensors()`'s flat 1-Reserves active-use cost, charged
 *    immediately at call time, separate from the continuous balance.
 */

export interface PowerState {
  reserves: number;
  maxReserves: number;
  output: number;
  overloaded: boolean;
}

export function createPowerState(output: number, maxReserves: number): PowerState {
  return { reserves: maxReserves, maxReserves, output, overloaded: false };
}

/**
 * Immediate, call-time deduction for `sensors()`. Fails (does not
 * deduct, does not force overload by itself) if Reserves can't cover
 * the flat 1-point cost.
 */
export function attemptSensorsReservesCharge(state: PowerState): { success: boolean; state: PowerState } {
  if (state.overloaded || state.reserves < 1) {
    return { success: false, state };
  }
  return { success: true, state: { ...state, reserves: state.reserves - 1 } };
}

/**
 * Resolves one tick's continuous draw against Output. Overdraw comes
 * out of Reserves; underdraw recharges Reserves (capped at max).
 * Overload triggers only when Reserves can't cover an overdraw
 * (drained past empty *and* still short of what's owed). While
 * overloaded, every system is silent (draw is forced to 0) and the
 * plant's full Output goes to recharging Reserves each tick, until
 * Reserves is back at its max -- not just above zero.
 */
export function tickPowerBalance(state: PowerState, continuousDraw: number): PowerState {
  if (state.overloaded) {
    const reserves = Math.min(state.maxReserves, state.reserves + state.output);
    return { ...state, reserves, overloaded: reserves < state.maxReserves };
  }

  const net = continuousDraw - state.output;
  if (net <= 0) {
    return { ...state, reserves: Math.min(state.maxReserves, state.reserves - net) };
  }
  if (net > state.reserves) {
    return { ...state, reserves: 0, overloaded: true };
  }
  return { ...state, reserves: state.reserves - net };
}
