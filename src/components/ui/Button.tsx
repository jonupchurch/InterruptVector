import type { ButtonHTMLAttributes } from "react";

type Signal = "cyan" | "green" | "amber" | "red";

const SIGNAL_CLASSES: Record<Signal, string> = {
  cyan: "border-cyan text-cyan hover:bg-cyan/10",
  green: "border-green text-green hover:bg-green/10",
  amber: "border-amber text-amber hover:bg-amber/10",
  red: "border-red text-red hover:bg-red/10",
};

export function Button({
  signal = "cyan",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { signal?: Signal }) {
  return (
    <button
      className={`rounded-[3px] border px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${SIGNAL_CLASSES[signal]} ${className}`}
      {...props}
    />
  );
}
