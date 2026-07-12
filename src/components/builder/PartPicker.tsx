interface PartPickerProps {
  label: string;
  maxUnlockedTier: number;
  minTier: number;
  maxTier: number;
  selectedTier: number;
  onSelect: (tier: number) => void;
  describeTier: (tier: number) => string;
}

export function PartPicker({
  label,
  maxUnlockedTier,
  minTier,
  maxTier,
  selectedTier,
  onSelect,
  describeTier,
}: PartPickerProps) {
  const tiers = Array.from({ length: maxTier - minTier + 1 }, (_, i) => minTier + i);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-text-mid">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {tiers.map((tier) => {
          const unlocked = tier <= maxUnlockedTier;
          const selected = tier === selectedTier;
          return (
            <button
              key={tier}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelect(tier)}
              title={unlocked ? describeTier(tier) : "Locked"}
              className={[
                "rounded-[3px] border px-3 py-2 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                selected ? "border-cyan bg-cyan/10 text-cyan" : "border-line text-text-mid hover:border-text-mid",
              ].join(" ")}
            >
              {describeTier(tier)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
