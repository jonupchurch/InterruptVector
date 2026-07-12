/**
 * Uncaught pilot-code exceptions never escalate -- a bad tick just
 * doesn't finish, no extra penalty (wiki: Pilot Code, "Error
 * handling"). Runaway violations (step-budget or memory) are
 * different: three *consecutive* violations forfeits the match
 * (spec FR-013), since that's a script structurally incapable of
 * completing a tick, not a one-off bug.
 */
export const MAX_CONSECUTIVE_RUNAWAY_VIOLATIONS = 3;

export interface RunawayTracker {
  consecutiveViolations: number;
}

export function createRunawayTracker(): RunawayTracker {
  return { consecutiveViolations: 0 };
}

export interface RunawayCheckResult {
  tracker: RunawayTracker;
  forfeited: boolean;
}

export function recordRunawayViolation(tracker: RunawayTracker): RunawayCheckResult {
  const consecutiveViolations = tracker.consecutiveViolations + 1;
  return {
    tracker: { consecutiveViolations },
    forfeited: consecutiveViolations >= MAX_CONSECUTIVE_RUNAWAY_VIOLATIONS,
  };
}

/** A tick that completes without a runaway violation resets the streak -- only *consecutive* violations count. */
export function recordCleanTick(): RunawayTracker {
  return { consecutiveViolations: 0 };
}
