"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import type { TickSnapshot } from "@/engine/replay-log";

export function ReplayViewer({
  outcome,
  finalTick,
  tickLog,
}: {
  outcome: "win" | "loss" | null;
  finalTick: number | null;
  tickLog: TickSnapshot[];
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => {
          if (i >= tickLog.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 50);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, tickLog.length]);

  const snapshot = tickLog[index];
  const allLogsUpToNow = useMemo(() => (snapshot ? snapshot.logs : []), [snapshot]);

  if (tickLog.length === 0) {
    return <span className="font-mono text-sm text-text-dim">No tick data recorded for this battle.</span>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Outcome">
        <div className={`font-mono text-lg ${outcome === "win" ? "text-green" : "text-red"}`}>
          {outcome === "win" ? "VICTORY" : "DEFEAT"} — {finalTick} ticks
        </div>
      </Panel>

      <Panel title={`Tick ${snapshot.tick} / ${tickLog[tickLog.length - 1].tick}`}>
        <div className="flex flex-col gap-3">
          <input
            type="range"
            aria-label="Replay tick scrubber"
            min={0}
            max={tickLog.length - 1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button signal="cyan" onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </Button>
            <Button signal="cyan" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              ◀ Step
            </Button>
            <Button signal="cyan" onClick={() => setIndex((i) => Math.min(tickLog.length - 1, i + 1))}>
              Step ▶
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-sm">
            {Object.entries(snapshot.tanks).map(([tankId, tank]) => (
              <div key={tankId} className="flex flex-col gap-1 rounded border border-line p-3">
                <span className="text-text-mid uppercase">{tankId}</span>
                <span className="text-text">
                  HP {tank.hp} · ({tank.x.toFixed(0)}, {tank.y.toFixed(0)})
                </span>
                <span className="text-text-dim">
                  Reserves {tank.powerReserves} {tank.overloaded ? "(overloaded)" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Log">
        <div className="flex flex-col gap-1 font-mono text-xs">
          {allLogsUpToNow.length === 0 && <span className="text-text-dim">No messages this tick.</span>}
          {allLogsUpToNow.map((entry, i) => (
            <div key={i} className={entry.source === "system" ? "text-amber" : "text-cyan"}>
              [{entry.tankId}] {entry.message}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
