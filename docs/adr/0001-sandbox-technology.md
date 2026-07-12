# ADR 0001: Sandbox technology for pilot code

**Status**: Accepted
**Date**: 2026-07-11
**Related**: [specs/001-core-battle-loop/research.md](../../specs/001-core-battle-loop/research.md), constitution Principle II & Technology Constraints

## Context

Player-submitted pilot code is untrusted, adversarial input (Principle
II) that must execute with no network access, no filesystem access,
and hard CPU/memory limits, called once per simulation tick — up to
~3,000 times per tank per match. Two candidates were evaluated: an
embedded WASM JS interpreter run in-process, and Vercel Sandbox
(managed microVM).

## Decision

Use an embedded WASM JavaScript interpreter — `quickjs-emscripten`
(QuickJS compiled to WebAssembly) — run in-process inside the Next.js
server, under `src/engine/sandbox/`.

## Rationale

- **Call pattern fit**: `pilotCode` is a narrow, high-frequency,
  in-process call (thousands per match), not an occasional heavyweight
  job — the shape Vercel Sandbox (a real ephemeral micro-VM per
  invocation) is built for. Using Vercel Sandbox well would require
  running the entire tick-simulation loop inside the sandbox, coupling
  core engine logic to a third-party service instead of code this
  project owns.
- **Sandboxing by construction**: a bare WASM interpreter context has
  no ambient access to `fs`/`net`/`process` unless deliberately
  exposed as host functions — exactly how the Pilot Code `api` surface
  (`self`, `sensors`, `fire`, etc.) gets wired up, and a stronger
  starting position than trying to lock down a general-purpose VM.
- **Determinism**: WASM execution is simple and self-contained,
  supporting Principle V's byte-identical-replay requirement without
  the additional moving parts (scheduling, wall-clock-adjacent
  behavior) a real VM introduces.
- **Deployment portability**: WASM is portable bytecode with no
  architecture/ABI-matching risk on Vercel's serverless build
  pipeline — unlike the also-considered `isolated-vm` (a native Node
  addon offering real V8 JIT speed, but fragile specifically because
  of that native-addon requirement).
- **Real-time is not a requirement**: matches are queued and simulated
  server-side whenever resources are available (spec FR-017), not on
  a request/response deadline, which removes QuickJS's interpreter
  (non-JIT) speed as a practical concern.

## Alternatives Rejected

- **Vercel Sandbox** — wrong shape for the call pattern (see above).
- **`isolated-vm`** — faster (real V8 isolate/JIT), but a native addon;
  the deployment fragility outweighs a speed advantage that doesn't
  matter once execution isn't real-time-bound.
- **Node's built-in `vm` module** — rejected outright; known sandbox
  escape vectors make it unsuitable for genuinely untrusted code
  regardless of performance.

## Consequences

- Every exposed `api` host function needs explicit value marshaling
  across the WASM boundary (no implicit object passing) — real,
  ongoing integration work each time the `api` surface changes.
- Step-count budget enforcement (spec FR-012) and a separate WASM
  memory ceiling (spec Edge Cases) both need explicit handling in
  `src/engine/sandbox/`; neither is automatic.
- Error messages surfaced from inside the sandbox (via `log()`'s
  `system` channel) will likely be less rich than native V8 errors —
  acceptable, but worth remembering when designing that channel's UX.
