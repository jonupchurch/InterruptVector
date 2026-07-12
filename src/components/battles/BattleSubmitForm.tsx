"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export interface BuildOption {
  id: number;
  name: string;
}
export interface ProgramOption {
  id: number;
  name: string;
}
export interface OpponentOption {
  id: number;
  name: string;
  kind: "boss" | "challenger";
  rankTier: number;
}

interface BattleStatus {
  id: number;
  status: "queued" | "simulating" | "complete" | "failed";
  outcome: "win" | "loss" | null;
  errorMessage?: string | null;
}

export function BattleSubmitForm({
  builds,
  programs,
  opponents,
}: {
  builds: BuildOption[];
  programs: ProgramOption[];
  opponents: OpponentOption[];
}) {
  const [buildId, setBuildId] = useState<number | null>(builds[0]?.id ?? null);
  const [programId, setProgramId] = useState<number | null>(programs[0]?.id ?? null);
  const [opponentId, setOpponentId] = useState<number | null>(opponents[0]?.id ?? null);
  const [battle, setBattle] = useState<BattleStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleSubmit() {
    if (!buildId || !programId || !opponentId) return;
    setSubmitting(true);
    const res = await fetch("/api/battles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ buildId, programId, opponentId }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return;

    setBattle({ id: data.battleId, status: data.status, outcome: null });
    pollRef.current = setInterval(async () => {
      const pollRes = await fetch(`/api/battles/${data.battleId}`);
      const polled = await pollRes.json();
      setBattle({ id: polled.id, status: polled.status, outcome: polled.outcome, errorMessage: polled.errorMessage });
      if ((polled.status === "complete" || polled.status === "failed") && pollRef.current) {
        clearInterval(pollRef.current);
      }
    }, 1000);
  }

  const boss = opponents.find((o) => o.kind === "boss");
  const challengers = opponents.filter((o) => o.kind === "challenger");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel title="Deploy">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs text-text-dim">Build</span>
            <select
              value={buildId ?? ""}
              onChange={(e) => setBuildId(Number(e.target.value))}
              className="rounded-[3px] border border-line bg-well px-3 py-2 font-mono text-sm text-text"
            >
              {builds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs text-text-dim">Program</span>
            <select
              value={programId ?? ""}
              onChange={(e) => setProgramId(Number(e.target.value))}
              className="rounded-[3px] border border-line bg-well px-3 py-2 font-mono text-sm text-text"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs text-text-dim">Opponent</span>
            <select
              value={opponentId ?? ""}
              onChange={(e) => setOpponentId(Number(e.target.value))}
              className="rounded-[3px] border border-line bg-well px-3 py-2 font-mono text-sm text-text"
            >
              {boss && <option value={boss.id}>{boss.name} (Boss, Rank {boss.rankTier})</option>}
              {challengers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Challenger, Rank {c.rankTier})
                </option>
              ))}
            </select>
          </label>
          <Button
            signal="red"
            disabled={!buildId || !programId || !opponentId || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting…" : "Engage"}
          </Button>
        </div>
      </Panel>

      <Panel title="Status">
        {!battle && <span className="font-mono text-xs text-text-dim">No battle submitted yet.</span>}
        {battle && (
          <div className="flex flex-col gap-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-text-dim">Battle #{battle.id}</span>
              <span className="text-text">{battle.status}</span>
            </div>
            {battle.status === "failed" && (
              <div className="text-red">
                SIMULATION FAILED{battle.errorMessage ? ` -- ${battle.errorMessage}` : ""}
              </div>
            )}
            {battle.status === "complete" && (
              <div className={battle.outcome === "win" ? "text-green" : "text-red"}>
                {battle.outcome === "win" ? "VICTORY" : "DEFEAT"}
              </div>
            )}
            {battle.status === "complete" && (
              <a href={`/replay/${battle.id}`} className="text-cyan underline">
                View Replay
              </a>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
