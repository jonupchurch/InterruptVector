export default function Home() {
  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col items-start justify-center px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-green">System Online</span>
      <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-text">
        Interrupt Vector
      </h1>
      <p className="mt-3 max-w-xl font-mono text-sm leading-relaxed text-text-mid">
        <span className="text-green">&gt;</span> Program a tank. Fight a machine. Watch the replay.
      </p>
    </div>
  );
}
