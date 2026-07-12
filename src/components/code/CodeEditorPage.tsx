"use client";

import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export interface SavedProgram {
  id: number;
  name: string;
  sourceCode: string;
}

const DEFAULT_SOURCE = `// pilotCode(api) is called once per tick.\nfunction pilotCode(api) {\n  const bogeys = api.sensors();\n  if (bogeys !== -1 && bogeys.length > 0) {\n    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);\n    api.fire();\n  } else {\n    api.moveForward();\n  }\n}\n`;

export function CodeEditorPage({ initialPrograms }: { initialPrograms: SavedProgram[] }) {
  const [programs, setPrograms] = useState(initialPrograms);
  const [selectedId, setSelectedId] = useState<number | null>(initialPrograms[0]?.id ?? null);
  const [name, setName] = useState(initialPrograms[0]?.name ?? "New Program");
  const [source, setSource] = useState(initialPrograms[0]?.sourceCode ?? DEFAULT_SOURCE);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function selectProgram(program: SavedProgram) {
    setSelectedId(program.id);
    setName(program.name);
    setSource(program.sourceCode);
    setSaveState("idle");
    setErrorMessage(null);
  }

  function newProgram() {
    setSelectedId(null);
    setName("New Program");
    setSource(DEFAULT_SOURCE);
    setSaveState("idle");
    setErrorMessage(null);
  }

  async function handleSave() {
    setSaveState("saving");
    setErrorMessage(null);
    const res = await fetch(selectedId ? `/api/programs/${selectedId}` : "/api/programs", {
      method: selectedId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, sourceCode: source }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      // Deliberately don't touch `source` here -- a syntax error must
      // never discard the player's unsaved text (spec Edge Cases).
      setErrorMessage(data?.errors?.[0]?.message ?? "Failed to save.");
      setSaveState("error");
      return;
    }
    const saved: SavedProgram = await res.json();
    setPrograms((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
    });
    setSelectedId(saved.id);
    setSaveState("saved");
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_3fr]">
      <Panel title="Programs">
        <div className="flex flex-col gap-2">
          <Button signal="cyan" onClick={newProgram} className="mb-2">
            + New Program
          </Button>
          {programs.map((program) => (
            <button
              key={program.id}
              type="button"
              onClick={() => selectProgram(program)}
              className={[
                "rounded-[3px] border px-3 py-2 text-left font-mono text-xs transition-colors",
                program.id === selectedId ? "border-cyan bg-cyan/10 text-cyan" : "border-line text-text-mid hover:border-text-mid",
              ].join(" ")}
            >
              {program.name}
            </button>
          ))}
        </div>
      </Panel>

      <div className="flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-[3px] border border-line bg-well px-3 py-2 font-mono text-sm text-text outline-none focus:border-cyan"
          placeholder="Program name"
        />
        <div className="overflow-hidden rounded-md border border-line">
          <Editor
            height="60vh"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={source}
            onChange={(value) => setSource(value ?? "")}
            options={{ minimap: { enabled: false }, fontSize: 13 }}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button signal="green" disabled={saveState === "saving"} onClick={handleSave}>
            {saveState === "saving" ? "Saving…" : selectedId ? "Update Program" : "Save Program"}
          </Button>
          {saveState === "saved" && <span className="font-mono text-xs text-green">Saved.</span>}
          {errorMessage && <span className="font-mono text-xs text-red">{errorMessage}</span>}
        </div>
      </div>
    </div>
  );
}
