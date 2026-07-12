import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Signal = "cyan" | "green" | "amber" | "red";

const SIGNAL_CLASSES: Record<Signal, string> = {
  cyan: "border-cyan text-cyan hover:bg-cyan/10",
  green: "border-green text-green hover:bg-green/10",
  amber: "border-amber text-amber hover:bg-amber/10",
  red: "border-red text-red hover:bg-red/10",
};

const BASE_CLASSES =
  "rounded-[3px] border px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  signal = "cyan",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { signal?: Signal }) {
  return <button className={`${BASE_CLASSES} ${SIGNAL_CLASSES[signal]} ${className}`} {...props} />;
}

/**
 * A Button-styled navigation link. Deliberately a separate component
 * from Button rather than Button-wrapped-in-Link -- a <button> nested
 * inside an <a> creates two overlapping interactive roles, a real
 * accessibility problem (WCAG 2.1 AA target, Principle III), not just
 * a style nit.
 */
export function LinkButton({
  signal = "cyan",
  className = "",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { signal?: Signal; href: string }) {
  return (
    <Link href={href} className={`inline-block ${BASE_CLASSES} ${SIGNAL_CLASSES[signal]} ${className}`} {...props} />
  );
}
