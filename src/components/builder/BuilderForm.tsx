"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { derivedStats } from "@/lib/derived-stats";
import { CHASSIS, MOBILITY, POWER_PLANTS, SENSORS, WEAPONS } from "@/lib/parts-catalog";
import { unlockedTiersForRank } from "@/lib/unlocks";
import { validateWeightCapacity } from "@/lib/weight-validation";
import { PartPicker } from "./PartPicker";

export interface SavedBuild {
  id: number;
  name: string;
  chassisTier: number;
  weaponTier: number;
  sensorTier: number;
  mobilityTier: number;
  powerTier: number;
}

export function BuilderForm({ rank, initialBuild }: { rank: number; initialBuild: SavedBuild | null }) {
  const unlocked = unlockedTiersForRank(rank);

  const [name, setName] = useState(initialBuild?.name ?? "");
  const [chassisTier, setChassisTier] = useState(initialBuild?.chassisTier ?? 1);
  const [weaponTier, setWeaponTier] = useState(initialBuild?.weaponTier ?? 1);
  const [sensorTier, setSensorTier] = useState(initialBuild?.sensorTier ?? 1);
  const [mobilityTier, setMobilityTier] = useState(initialBuild?.mobilityTier ?? 1);
  const [powerTier, setPowerTier] = useState(initialBuild?.powerTier ?? 1);
  const [savedId, setSavedId] = useState<number | null>(initialBuild?.id ?? null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  const selection = useMemo(
    () => ({ chassisTier, weaponTier, sensorTier, mobilityTier, powerTier }),
    [chassisTier, weaponTier, sensorTier, mobilityTier, powerTier],
  );
  const weightCheck = useMemo(() => validateWeightCapacity(selection), [selection]);
  const stats = useMemo(() => derivedStats(selection), [selection]);
  const buildValid = weightCheck.valid && name.trim().length > 0;

  async function handleSave() {
    setSaveState("saving");
    setErrors([]);
    const body = { name, chassisTier, weaponTier, sensorTier, mobilityTier, powerTier };
    const res = await fetch(savedId ? `/api/builds/${savedId}` : "/api/builds", {
      method: savedId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErrors((data?.errors ?? []).map((e: { message: string }) => e.message));
      setSaveState("error");
      return;
    }
    const saved = await res.json();
    setSavedId(saved.id);
    setSaveState("saved");
  }

  return (
    <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        <Panel title="Outfitting">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs text-text-dim">Tank name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="RAZORBACK"
              className="rounded-[3px] border border-line bg-well px-3 py-2 font-mono text-sm text-text outline-none focus:border-cyan"
            />
          </label>
        </Panel>

        <Panel title="Hardpoints">
          <div className="flex flex-col gap-5">
            <PartPicker
              label="Chassis"
              minTier={1}
              maxTier={10}
              maxUnlockedTier={unlocked.chassis}
              selectedTier={chassisTier}
              onSelect={setChassisTier}
              describeTier={(t) => CHASSIS[t - 1].name}
            />
            <PartPicker
              label="Weapon"
              minTier={1}
              maxTier={10}
              maxUnlockedTier={unlocked.weapon}
              selectedTier={weaponTier}
              onSelect={setWeaponTier}
              describeTier={(t) => WEAPONS[t - 1].name}
            />
            <PartPicker
              label="Sensors / Mobility / Power"
              minTier={1}
              maxTier={5}
              maxUnlockedTier={unlocked.sensor}
              selectedTier={sensorTier}
              onSelect={setSensorTier}
              describeTier={(t) => `Sensor T${t} (${SENSORS[t - 1].range} range)`}
            />
            <PartPicker
              label=""
              minTier={1}
              maxTier={5}
              maxUnlockedTier={unlocked.mobility}
              selectedTier={mobilityTier}
              onSelect={setMobilityTier}
              describeTier={(t) => `Mobility T${t} (${MOBILITY[t - 1].enginePower} pwr)`}
            />
            <PartPicker
              label=""
              minTier={1}
              maxTier={5}
              maxUnlockedTier={unlocked.power}
              selectedTier={powerTier}
              onSelect={setPowerTier}
              describeTier={(t) => `Power T${t} (${POWER_PLANTS[t - 1].output} output)`}
            />
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-4">
        <Panel title="Status">
          <div className="flex flex-col gap-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-text-dim">Rank</span>
              <span className="text-text">{rank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Total Weight</span>
              <span className="text-text">{stats.totalWeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Speed</span>
              <span className="text-text">{stats.speed.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Weight Capacity</span>
              <span className={weightCheck.valid ? "text-green" : "text-red"}>
                {weightCheck.combinedWeight} / {weightCheck.weightCapacity}
              </span>
            </div>
            <div className="mt-2 border-t border-line pt-2">
              <span className={buildValid ? "text-green" : "text-red"}>
                {buildValid ? "Build Valid" : "Invalid"}
              </span>
            </div>
          </div>
        </Panel>

        {errors.length > 0 && (
          <Panel title="Errors">
            <ul className="flex flex-col gap-1 font-mono text-xs text-red">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Panel>
        )}

        <Button signal="green" disabled={!buildValid || saveState === "saving"} onClick={handleSave}>
          {saveState === "saving" ? "Saving…" : savedId ? "Update Build" : "Save Build"}
        </Button>
        {saveState === "saved" && <span className="font-mono text-xs text-green">Saved.</span>}
      </div>
    </div>
  );
}
