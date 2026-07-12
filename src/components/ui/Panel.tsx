import type { ReactNode } from "react";

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-panel">
      <div className="border-b border-line px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-text-mid">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
