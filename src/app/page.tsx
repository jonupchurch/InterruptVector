import { eq } from "drizzle-orm";
import { LinkButton } from "@/components/ui/Button";
import { db } from "@/db";
import { battles } from "@/db/schema";
import { getCurrentPilotProfile } from "@/lib/pilot-profile";

export default async function Home() {
  const profile = await getCurrentPilotProfile();
  const history = await db.select().from(battles).where(eq(battles.pilotProfileId, profile.id));
  const wins = history.filter((b) => b.outcome === "win").length;

  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-green">System Online</span>
      <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-text">
        Interrupt Vector
      </h1>
      <p className="mt-3 max-w-xl font-mono text-sm leading-relaxed text-text-mid">
        <span className="text-green">&gt;</span> Program a tank. Fight a machine. Watch the replay.
      </p>
      <p className="mt-6 max-w-xl font-display leading-relaxed text-text-mid">
        You will never touch a throttle or a trigger directly. You choose the
        chassis, the weapon, the sensors, the power plant — then you write the
        handler, the code that makes every decision your tank will ever make,
        before it ever leaves the bay. Once a build ships, it fights exactly
        as written. Every match is the only rehearsal you get.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/builder" signal="green">Enter the Bay</LinkButton>
        <LinkButton href="/code" signal="cyan">The Socket</LinkButton>
        <LinkButton href="/battles" signal="amber">Battles</LinkButton>
      </div>

      <div className="mt-10 flex gap-8 border-t border-line pt-6 font-mono text-xs uppercase tracking-[0.14em] text-text-dim">
        <span>
          Rank <span className="text-text">{profile.rank} / 10</span>
        </span>
        <span>
          Battles Fought <span className="text-text">{history.length}</span>
        </span>
        <span>
          Wins <span className="text-text">{wins}</span>
        </span>
      </div>
    </div>
  );
}
