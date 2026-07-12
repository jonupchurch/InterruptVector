import { describe, expect, it } from "vitest";
import { advanceTick, createSystemQueue, isBusy, request } from "./queue";

describe("SystemQueue", () => {
  it("starts idle", () => {
    expect(isBusy(createSystemQueue())).toBe(false);
  });

  it("starts an action immediately when idle", () => {
    const queue = request(createSystemQueue<string>(), "turn-north", 3);
    expect(isBusy(queue)).toBe(true);
    expect(queue.current?.action).toBe("turn-north");
    expect(queue.ticksRemaining).toBe(3);
  });

  it("counts down and reports completion when the action finishes", () => {
    let queue = request(createSystemQueue<string>(), "turn-north", 2);
    let result = advanceTick(queue);
    expect(result.completed).toBeNull();
    expect(result.queue.ticksRemaining).toBe(1);
    queue = result.queue;
    result = advanceTick(queue);
    expect(result.completed).toBe("turn-north");
    expect(isBusy(result.queue)).toBe(false);
  });

  it("queues a second action behind a busy one instead of rejecting it, and starts it once the first completes", () => {
    let queue = request(createSystemQueue<string>(), "first", 2);
    queue = request(queue, "second", 5);
    expect(queue.queued?.action).toBe("second");
    expect(queue.current?.action).toBe("first"); // unaffected

    let result = advanceTick(queue); // tick 1: first still in flight
    expect(result.completed).toBeNull();
    result = advanceTick(result.queue); // tick 2: first completes, second starts
    expect(result.completed).toBe("first");
    expect(result.queue.current?.action).toBe("second");
    expect(result.queue.ticksRemaining).toBe(5);
  });

  it("caps queue depth at 1 -- a new call while one is already queued replaces it", () => {
    let queue = request(createSystemQueue<string>(), "first", 5);
    queue = request(queue, "second-queued", 1);
    queue = request(queue, "third-queued", 1);
    expect(queue.queued?.action).toBe("third-queued");
  });
});
