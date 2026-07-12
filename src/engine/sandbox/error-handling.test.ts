import { describe, expect, it } from "vitest";
import { createRunawayTracker, recordCleanTick, recordRunawayViolation } from "./error-handling";

describe("runaway violation tracking", () => {
  it("does not forfeit on the first or second consecutive violation", () => {
    let tracker = createRunawayTracker();
    let result = recordRunawayViolation(tracker);
    expect(result.forfeited).toBe(false);
    tracker = result.tracker;
    result = recordRunawayViolation(tracker);
    expect(result.forfeited).toBe(false);
  });

  it("forfeits on the third consecutive violation", () => {
    let tracker = createRunawayTracker();
    tracker = recordRunawayViolation(tracker).tracker;
    tracker = recordRunawayViolation(tracker).tracker;
    const result = recordRunawayViolation(tracker);
    expect(result.forfeited).toBe(true);
  });

  it("a clean tick resets the streak", () => {
    let tracker = createRunawayTracker();
    tracker = recordRunawayViolation(tracker).tracker;
    tracker = recordRunawayViolation(tracker).tracker;
    tracker = recordCleanTick();
    tracker = recordRunawayViolation(tracker).tracker;
    const result = recordRunawayViolation(tracker);
    expect(result.forfeited).toBe(false); // only 2 consecutive since the reset
  });
});
