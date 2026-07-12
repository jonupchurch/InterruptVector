/**
 * Step-count execution budget (spec FR-012). Counts interpreter
 * operations via QuickJS's interrupt handler rather than wall-clock
 * time, so the cap is hardware-independent -- required for
 * byte-identical replays (Principle V). Exact step count is an
 * implementation tuning detail, not a design commitment.
 */
export const DEFAULT_STEP_BUDGET = 500_000;

export interface StepBudgetGuard {
  /** Pass to context.runtime.setInterruptHandler -- returns true to abort execution. */
  handler: () => boolean;
  /** True if the most recent call was aborted by this guard. */
  wasTripped: () => boolean;
  /** Reset the step counter and tripped flag before the next call. */
  reset: () => void;
}

export function createStepBudgetGuard(maxSteps: number = DEFAULT_STEP_BUDGET): StepBudgetGuard {
  let steps = 0;
  let tripped = false;
  return {
    handler: () => {
      steps++;
      if (steps > maxSteps) {
        tripped = true;
        return true;
      }
      return false;
    },
    wasTripped: () => tripped,
    reset: () => {
      steps = 0;
      tripped = false;
    },
  };
}
