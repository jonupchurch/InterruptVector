import Link from "next/link";
import { Panel } from "@/components/ui/Panel";

export interface HistoryEntry {
  id: number;
  status: "queued" | "simulating" | "complete" | "failed";
  outcome: "win" | "loss" | null;
  finalTick: number | null;
  submittedAt: string | Date;
}

export function BattleHistory({ battles }: { battles: HistoryEntry[] }) {
  if (battles.length === 0) {
    return (
      <Panel title="History">
        <span className="font-mono text-xs text-text-dim">No battles fought yet.</span>
      </Panel>
    );
  }

  const sorted = [...battles].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  return (
    <Panel title="History">
      <ul className="flex flex-col gap-2 font-mono text-sm">
        {sorted.map((battle) => (
          <li key={battle.id} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
            <span className="text-text-dim">Battle #{battle.id}</span>
            <span
              className={
                battle.status === "complete"
                  ? battle.outcome === "win"
                    ? "text-green"
                    : "text-red"
                  : battle.status === "failed"
                    ? "text-red"
                    : "text-text-mid"
              }
            >
              {battle.status === "complete" ? (battle.outcome === "win" ? "WIN" : "LOSS") : battle.status}
            </span>
            {battle.status === "complete" ? (
              <Link href={`/replay/${battle.id}`} className="text-cyan underline">
                Replay
              </Link>
            ) : (
              <span className="text-text-dim">—</span>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
