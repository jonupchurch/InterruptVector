import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/builder", label: "The Bay" },
  { href: "/code", label: "The Socket" },
  { href: "/battles", label: "Battles" },
] as const;

export function Nav() {
  return (
    <nav className="border-b border-line bg-base">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-text">
          Interrupt Vector
        </span>
        <ul className="flex flex-1 flex-wrap gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.12em] text-text-mid">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-cyan">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
