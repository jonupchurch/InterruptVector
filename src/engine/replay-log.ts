import type { LogEntry } from "./tank-state";

/** One tick's recorded state (spec FR-023) -- tank state and log messages. Damage is visible via hp deltas between ticks. */
export interface TickSnapshot {
  tick: number;
  tanks: Record<
    string,
    {
      hp: number;
      x: number;
      y: number;
      headingIndex: number;
      turretBearingDegrees: number;
      powerReserves: number;
      overloaded: boolean;
    }
  >;
  logs: LogEntry[];
}

export type TickLog = TickSnapshot[];

export function createTickLogRecorder() {
  const log: TickLog = [];
  return {
    record: (snapshot: TickSnapshot) => log.push(snapshot),
    getLog: (): TickLog => log,
  };
}
