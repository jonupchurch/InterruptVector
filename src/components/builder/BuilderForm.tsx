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

const DEFAULTS = { chassisTier: 1, weaponTier: 1, sensorTier: 1, mobilityTier: 1, powerTier: 1 };

export function BuilderForm({ rank, builds: initialBuilds }: { rank: number; builds: SavedBuild[] }) {
  const unlocked = unlockedTiersForRank(rank);
  const mostRecent = initialBuilds[0] ?? null;

  const [builds, setBuilds] = useState(initialBuilds);
  const [name, setName] = useState(mostRecent?.name ?? "");
  const [chassisTier, setChassisTier] = useState(mostRecent?.chassisTier ?? DEFAULTS.chassisTier);
  const [weaponTier, setWeaponTier] = useState(mostRecent?.weaponTier ?? DEFAULTS.weaponTier);
  const [sensorTier, setSensorTier] = useState(mostRecent?.sensorTier ?? DEFAULTS.sensorTier);
  const [mobilityTier, setMobilityTier] = useState(mostRecent?.mobilityTier ?? DEFAULTS.mobilityTier);
  const [powerTier, setPowerTier] = useState(mostRecent?.powerTier ?? DEFAULTS.powerTier);
  const [savedId, setSavedId] = useState<number | null>(mostRecent?.id ?? null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  const selection = useMemo(
    () => ({ chassisTier, weaponTier, sensorTier, mobilityTier, powerTier }),
    [chassisTier, weaponTier, sensorTier, mobilityTier, powerTier],
  );
  const weightCheck = useMemo(() => validateWeightCapacity(selection), [selection]);
  const stats = useMemo(() => derivedStats(selection), [selection]);
  const buildValid = weightCheck.valid && name.trim().length > 0;

  function selectBuild(build: SavedBuild) {
    setSavedId(build.id);
    setName(build.name);
    setChassisTier(build.chassisTier);
    setWeaponTier(build.weaponTier);
    setSensorTier(build.sensorTier);
    setMobilityTier(build.mobilityTier);
    setPowerTier(build.powerTier);
    setSaveState("idle");
    setErrors([]);
  }

  function newBuild() {
    setSavedId(null);
    setName("");
    setChassisTier(DEFAULTS.chassisTier);
    setWeaponTier(DEFAULTS.weaponTier);
    setSensorTier(DEFAULTS.sensorTier);
    setMobilityTier(DEFAULTS.mobilityTier);
    setPowerTier(DEFAULTS.powerTier);
    setSaveState("idle");
    setErrors([]);
  }

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
    const saved: SavedBuild = await res.json();
    setBuilds((prev) => {
      const exists = prev.some((b) => b.id === saved.id);
      return exists ? prev.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...prev];
    });
    setSavedId(saved.id);
    setSaveState("saved");
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_2fr_1fr]">
      <Panel title="Builds">
        <div className="flex flex-col gap-2">
          <Button signal="cyan" onClick={newBuild} className="mb-2">
            + New Build
          </Button>
          {builds.map((build) => (
            <button
              key={build.id}
              type="button"
              onClick={() => selectBuild(build)}
              className={[
                "rounded-[3px] border px-3 py-2 text-left font-mono text-xs transition-colors",
                build.id === savedId ? "border-cyan bg-cyan/10 text-cyan" : "border-line text-text-mid hover:border-text-mid",
              ].join(" ")}
            >
              {build.name}
            </button>
          ))}
        </div>
      </Panel>

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
