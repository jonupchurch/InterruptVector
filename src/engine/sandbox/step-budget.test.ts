import { describe, expect, it } from "vitest";
import { createStepBudgetGuard } from "./step-budget";

describe("createStepBudgetGuard", () => {
  it("does not trip before the budget is exceeded", () => {
    const guard = createStepBudgetGuard(5);
    for (let i = 0; i < 5; i++) {
      expect(guard.handler()).toBe(false);
    }
    expect(guard.wasTripped()).toBe(false);
  });

  it("trips once the budget is exceeded", () => {
    const guard = createStepBudgetGuard(3);
    guard.handler();
    guard.handler();
    guard.handler();
    expect(guard.handler()).toBe(true);
    expect(guard.wasTripped()).toBe(true);
  });

  it("resets cleanly for the next call", () => {
    const guard = createStepBudgetGuard(2);
    guard.handler();
    guard.handler();
    guard.handler(); // trips
    expect(guard.wasTripped()).toBe(true);
    guard.reset();
    expect(guard.wasTripped()).toBe(false);
    expect(guard.handler()).toBe(false);
  });
});
