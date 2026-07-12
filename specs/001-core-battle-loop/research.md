# Phase 0 Research: Core Battle Loop

Three technical unknowns from Technical Context, each resolved below and
written up as a standalone ADR under `docs/adr/` (Principle I).

## 1. Sandbox technology for pilot code

**Decision**: Embedded WASM JavaScript interpreter, specifically
`quickjs-emscripten` (QuickJS compiled to WebAssembly), run in-process
inside Next.js server code (the `src/engine/sandbox/` module).

**Rationale**: `pilotCode` is called once per tick, per tank, up to
~3,000 times per match — a narrow, high-frequency, in-process call
pattern, not an occasional heavyweight job. `quickjs-emscripten` is a
mature, actively-maintained npm package built specifically for
embedding a sandboxed JS realm inside a Node.js host: it has no
ambient access to `fs`/`net`/`process` unless deliberately exposed as
host functions (exactly how the `api` surface gets wired up), and
exposes an interrupt/opcode-count mechanism suitable for the
step-count execution budget required by spec FR-012. Being WASM
(portable bytecode) rather than a native addon, it carries no
architecture/ABI-matching risk on Vercel's serverless build pipeline.

**Alternatives considered**:
- *Vercel Sandbox* (managed microVM service) — rejected: fits running
  occasional heavyweight arbitrary code, not calling a narrow function
  thousands of times per match; using it well would mean running the
  whole tick-simulation loop inside the sandbox rather than in code
  this project owns, coupling core engine logic to a third-party
  service.
- *`isolated-vm`* (a real, separate V8 isolate) — rejected: genuine
  JIT-speed performance advantage, but it's a native Node addon, which
  is the fragile choice on serverless (must match the exact
  platform/architecture the function runs on). Since matches are
  queued/batch-simulated rather than real-time (spec FR-017),
  QuickJS's interpreter-level (non-JIT) speed is a non-issue, so
  `isolated-vm`'s main advantage doesn't apply here.
- Node's built-in `vm` module — rejected outright: well-known sandbox
  escape vectors (prototype pollution, constructor access), not
  considered safe for untrusted code regardless of performance.

## 2. Code editor for the coding page ("The Socket")

**Decision**: Monaco Editor (`@monaco-editor/react`).

**Rationale**: The Socket is a desktop-first, serious authoring
surface (Principle III) for real JavaScript, not a snippet box — pilot
code needs to reference a ten-method `api` reliably across programs
that may run to real length with loops/state machines. Monaco (the
editor that powers VS Code) gives syntax highlighting, bracket
matching, and a path to real autocomplete/IntelliSense against the
documented `api` surface later (e.g. via a bundled `.d.ts` for the
`api` object), which materially helps a player write correct pilot
code without leaving the page.

**Alternatives considered**:
- *CodeMirror 6* — lighter weight, better mobile/touch support.
  Rejected for v1 specifically because the coding page is explicitly
  desktop-first (Principle III already carves out this exception), so
  Monaco's larger bundle cost is an acceptable trade for the richer
  authoring experience; worth revisiting only if a mobile code-editing
  story ever becomes real scope.
- Plain `<textarea>` with a lightweight syntax-highlight overlay —
  rejected: no bracket matching or structural editing aid for
  non-trivial JS, meaningfully worse for the "IV pilot" framing this
  page exists to deliver on.

## 3. Replay tick-log storage shape

**Decision**: Store each battle's full tick-by-tick log as a single
JSONB payload in Postgres (a dedicated `battle_logs` table or column,
via Drizzle), not in separate object storage.

**Rationale**: A single match's log (state, `api` calls, damage
events, `log()` messages, per FR-023) is bounded — at most ~3,000
ticks × 2 tanks × a handful of events per tick — comfortably sized as
one JSONB document, not the "large" scale the constitution's draft
speculated about before any real data existed. Keeping it in Postgres
avoids standing up a second storage integration (object storage) for
v1, matches Principle IV's "simplest thing that works" spirit, and
keeps replay data in the same transactional store as the Battle
record it belongs to (no cross-store consistency to manage).

**Alternatives considered**:
- *Vercel Blob* (object storage) — the option the constitution's
  draft flagged as a candidate. Rejected for now, not permanently:
  revisit if per-match log size or total replay-storage volume becomes
  a real, measured operational concern (e.g. once PvP/Renown
  materially increases match volume) rather than a hypothetical one.
  Because the log is captured as one coherent JSON document either
  way, migrating from a JSONB column to blob storage later is a
  storage-layer change, not a data-model change.

## Summary

All three unknowns resolved; no remaining `NEEDS CLARIFICATION` markers
in Technical Context. ADR files for all three are written under
`docs/adr/` alongside this research (see plan.md's Constitution Check).
