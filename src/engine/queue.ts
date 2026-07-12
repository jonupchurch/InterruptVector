/**
 * Per-system action queue (spec FR-011). Each of the four systems
 * (movement, turret, fire, sensors) tracks its own busy/cooldown state
 * independently -- none of them block each other. A call made while a
 * system is busy queues behind the in-progress action rather than
 * failing or replacing it, but the queue is capped at depth 1 (one
 * in-flight, one queued) so a pilot can't front-load an entire
 * match's worth of actions on tick one -- see the Pilot Code wiki's
 * open question on queue depth, resolved here as the smallest useful
 * cap.
 */
export interface QueueSlot<T> {
  action: T;
  ticksRequired: number;
}

export interface SystemQueue<T> {
  current: QueueSlot<T> | null;
  ticksRemaining: number;
  queued: QueueSlot<T> | null;
}

export function createSystemQueue<T>(): SystemQueue<T> {
  return { current: null, ticksRemaining: 0, queued: null };
}

export function isBusy(queue: SystemQueue<unknown>): boolean {
  return queue.current !== null;
}

/** Starts immediately if idle, otherwise queues behind the in-flight action (replacing any previously-queued one). */
export function request<T>(queue: SystemQueue<T>, action: T, ticksRequired: number): SystemQueue<T> {
  const slot: QueueSlot<T> = { action, ticksRequired };
  if (queue.current === null) {
    return { current: slot, ticksRemaining: ticksRequired, queued: null };
  }
  return { ...queue, queued: slot };
}

export interface TickResult<T> {
  queue: SystemQueue<T>;
  /** Non-null the tick the in-flight action finishes -- caller applies its effect. */
  completed: T | null;
  /** Non-null the tick a *queued* action gets promoted to current and begins executing (distinct from `request`'s immediate-start case, which the caller already knows about synchronously). */
  started: T | null;
}

/** Advances this system's busy counter by one tick. */
export function advanceTick<T>(queue: SystemQueue<T>): TickResult<T> {
  if (queue.current === null) {
    return { queue, completed: null, started: null };
  }
  if (queue.ticksRemaining > 1) {
    return { queue: { ...queue, ticksRemaining: queue.ticksRemaining - 1 }, completed: null, started: null };
  }
  const completedAction = queue.current.action;
  if (queue.queued !== null) {
    return {
      queue: { current: queue.queued, ticksRemaining: queue.queued.ticksRequired, queued: null },
      completed: completedAction,
      started: queue.queued.action,
    };
  }
  return { queue: { current: null, ticksRemaining: 0, queued: null }, completed: completedAction, started: null };
}
