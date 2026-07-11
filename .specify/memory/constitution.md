<!--
Sync Impact Report
==================
Version change: (none) → 0.1.0-draft → 0.2.0-draft
Status: DRAFT — not yet ratified. Awaiting explicit user review/approval
  before RATIFICATION_DATE is set and this becomes v1.0.0.
Modified principles: II. Sandboxed Execution & Fair-Fight Integrity
  (v1 opponent redefined from a single scripted AI to the full ten-boss
  ladder, each individually coded); IV. Product Judgment & Scope
  Discipline (MVP description and out-of-scope list updated to match:
  the ladder itself is core v1 scope, not a fast-follow; practice
  challengers and the ally-commands surface added as explicitly
  deferred)
Added principles: n/a this revision
Added sections: n/a this revision (Technology Constraints' sandbox
  paragraph updated in place, not added)
Removed sections: n/a
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate is
     generic (no hardcoded principle names), compatible as-is.
  ✅ .specify/templates/spec-template.md — compatible.
  ✅ .specify/templates/tasks-template.md — compatible.
Provenance note: this project is a full restart of a prior project,
  t@nk.r (D:\Codelib\t@nk.r, draft constitution never ratified). This
  constitution reuses much of that draft's structure and principles,
  re-scoped for a smaller v1 (see Principle IV), and renames the
  project to Interrupt Vector. Per Principle I and the Governance
  section below, this reuse is a starting point, not inherited
  authority — this document is this project's own artifact.
Resolved since the initial draft (see the project wiki for full detail
  on each):
  - Sandbox technology: decided — embedded WASM JS interpreter (e.g.
    QuickJS-via-WASM), server-side, in-process. See Technology
    Constraints.
  - MVP part catalog: fully specified — Chassis and Weapon each ten
    tiers, Sensors/Mobility/Power each five tiers (new one every two
    ranks). See the wiki's Tanks pages.
  - Scripted AI opponents: all ten ladder bosses are individually
    hand-coded pilot code (not one shared algorithm), each on its own
    tier-appropriate hardware loadout, with behavioral sophistication
    (not just hardware) scaling by rank — bounded deliberately by
    realistic solo-dev coding effort, not an unbounded ambition. Exact
    per-boss behavior design is still open, tracked outside this
    document.
Still open, deliberately left as TODOs or "ADR owed" below:
  - Auth: v1 defaults to single-owner/no-login (no opponent player to
    authenticate against yet); revisit when async PvP work begins.
  - Exact per-boss behavior/difficulty calibration for each of the ten
    ladder bosses.
  - A formal ADR file for the sandbox technology decision (currently
    recorded in the wiki and in this document's prose, not yet as a
    standalone `docs/adr/` artifact per Principle I).
-->

# Interrupt Vector Constitution

## Core Principles

### I. Spec-Driven Development & Legible Architecture (NON-NEGOTIABLE)

The constitution, spec, plan, and tasks are first-class artifacts: they
MUST be committed to the repository (never gitignored) and MUST be kept
genuinely in sync with the code — not written once and abandoned. Every
non-trivial decision with a real tradeoff (sandbox execution model,
battle-simulation determinism, scripted-AI-opponent design, data model,
auth provider, storage choice) MUST be captured in a short Architecture
Decision Record (ADR) before or alongside the code that implements it.
The README MUST read as a guided tour: problem → spec excerpt → key
architectural decisions (linking ADRs) → how to run.

Rationale: this is a hobby project built solo, in the spirit of Omega
(1989) — program-your-tank, then compete. A documented process is how
the reasoning behind non-obvious calls (why this sandbox, why this AI
opponent design) stays legible to future-Jon, since a game built around
user-submitted code accumulates subtle, easy-to-forget constraints even
before a second human player is in the picture.

### II. Sandboxed Execution & Fair-Fight Integrity (NON-NEGOTIABLE)

Player-submitted tank code is untrusted input in the strongest sense —
it is arbitrary, adversarial code, not just untrusted data. It MUST
execute inside an isolated, resource-bounded sandbox with no network
access, no filesystem access, and no ability to reach the host or any
other process. Every sandbox run MUST enforce hard limits on CPU
time/step count and memory. Battles MUST be simulated server-side,
deterministically, from the canonical stored tank build (parts + code)
— a client MUST NEVER be trusted to report its own match result.

The v1 opponents are ten fixed, non-learning, project-authored scripted
bosses — one per rank of the ladder, each individually hand-coded
against its own tier-appropriate hardware loadout, not player-submitted
and not adversarial input, and therefore not themselves subject to the
sandbox boundary. Each boss's per-tick compute/action budget MUST still
be bounded to rules equivalent to a sandboxed player tank's, so a match
result is a genuine test of the player's code and not an artifact of a
boss having unbounded compute. The sandbox boundary MUST be architected
so a second, symmetric sandboxed combatant (async PvP, future-work per
Principle IV) can be substituted for a scripted boss without
rearchitecting the sandbox itself — this forward-compatibility is a
real constraint on today's design even though PvP is not being built
now. All data crossing a trust boundary (code submissions, part
loadouts, admin actions) MUST be validated before use. Once PvP exists,
a player's code and part loadout MUST NOT be exposed to an opponent
before or during a match they're both in.

Rationale: this principle is this project's analog to "trustworthy
commerce" in an e-commerce app — it's the one thing that, if it breaks,
doesn't just look bad but breaks the entire premise of the game (a
sandbox escape is a security incident; a nondeterministic simulation or
an unbounded AI-opponent budget makes every result meaningless, even in
a single-player vertical slice).

### III. Designed, Accessible Experience

The UI MUST have a distinctive visual identity — not default Tailwind,
not stock component-library defaults. Typography, spacing, and color
are deliberate choices. Every state MUST be designed: empty tank
garage, loading, error, code-submission validation failure, match
result, and replay viewer. The code editor itself is desktop-first (a
programming surface is a poor fit for small touch screens), but
browsing tanks, viewing match history, and watching a replay MUST work
on mobile. The accessibility **target** is WCAG 2.1 AA — keyboard
operability, visible focus, semantic landmarks/roles, AA contrast.
Automated axe checks SHOULD run in CI to surface issues, but this is a
goal to aim for and close on, not a hard merge-blocking gate; judgment
applies to genuine near-misses versus real barriers (e.g., a replay
viewer unusable without a mouse would block a merge).

Rationale: this is a hobby/portfolio project, not one facing the
compliance exposure a commercial product would; WCAG AA is a quality
bar worth aiming for on its own merits, not a legal requirement being
enforced here.

### IV. Product Judgment & Scope Discipline (NON-NEGOTIABLE)

One vertical slice done excellently beats a broad, half-built game
engine. The MVP is: a player builds a tank from a small, fixed catalog
of parts (chassis, weapon, sensor, mobility, power — each with real
stat tradeoffs, e.g. more armor costs power budget) → writes code
against a documented tank API (read sensor state, issue move/turn/fire
commands) in the project's supported language → submits the build,
which is validated and sandbox-tested → climbs a ten-rank boss ladder,
one fixed non-learning scripted boss per rank, each on its own
tier-appropriate hardware and individually hand-coded, fought one at a
time on one arena shape → each match is simulated server-side,
deterministically, and the player can view the outcome and a full
replay. The ladder itself — all ten bosses — is core v1 scope, not a
fast-follow; what's deferred is everything below.

Explicitly out of scope for the MVP (logged to `docs/future-work.md`,
not built now):
- Any human opponent or PvP — async, challenge-based base-raiding (not
  real-time), with a non-spendable Renown score/leaderboard rather
  than a spendable currency, is the explicit next milestone after this
  MVP, not abandoned, and Principle II's sandbox architecture MUST NOT
  foreclose it. It is still not part of v1.
- Matchmaking, ranking/rating (ELO/Glicko or otherwise), rank bands,
  leaderboards.
- Multi-user accounts/auth — v1 is single-owner with no login; this is
  a stated fast-follow once PvP work begins, not a permanent decision.
- Live spectating of a battle as it simulates in real time — MVP
  battles resolve server-side (queued/whenever resources are
  available, not on a real-time deadline) and are viewed as a replay
  afterward.
- Tournaments, brackets, or scheduled events.
- Clans/teams, chat, or any social feature.
- Multiple simultaneous arenas/maps, battle-royale-style multi-tank
  matches, or allied/multi-vehicle play — MVP is one tank vs. one
  scripted boss at a time on a single arena shape. (A reserved,
  undesigned placeholder for a future ally-commands API surface exists
  in the Pilot Code spec, but no multi-vehicle mode is being built.)
- A roster of optional, non-gating "practice challenger" opponents
  per tier beyond the one mandatory boss — real future value (variety,
  balance testing, PvP rehearsal) but not required for the ladder
  itself to work.
- More than one supported programming language/runtime for tank code.
- Cosmetics, in-game currency, or any monetization — the ladder has no
  currency at all (salvage from a boss kill *is* the unlock); the
  future PvP Renown score is explicitly non-spendable, not a currency.

Once `spec.md`'s MVP boundary is approved, it is frozen. Any new idea
surfaced mid-build MUST be logged to `docs/future-work.md` or an ADR
instead of being implemented, unless the spec is formally amended.

Rationale: the concept (build parts + write code + sandbox + simulate +
replay, with PvP and ranking to follow) invites scope sprawl across
several genuinely hard subsystems at once. A frozen boundary — the
ten-rank ladder, fought one boss at a time, nothing beyond it —
protects against shipping a half-built sandbox, a half-built replay
viewer, and a boss ladder with several ranks left unfinished, instead
of one complete loop. The ladder is real v1 scope specifically because
each boss's difficulty curve is designed to track realistic solo-dev
coding effort (see Progression's "bosses get smarter, not just
stronger"), not an unbounded one — that's what keeps ten individually-
coded opponents compatible with scope discipline rather than a
contradiction of it. This is still a deliberately smaller MVP than a
full PvP ladder, learned from a prior attempt (t@nk.r) that scoped
straight to multiplayer ranking.

### V. Test Discipline

Unit, integration, and e2e tests are all expected, as much as is
reasonable for a solo hobby project, for every feature/unit of work —
not just the non-negotiable items below. Every non-trivial unit of
business logic (part/stat calculation, battle-simulation tick logic,
scripted-boss decision logic, sandbox resource-limit enforcement) MUST
have unit tests before its task is considered done. Integration tests
MUST cover the seams unit tests can't (the sandbox boundary calling
into tick logic, an API route persisting a build and reloading it,
Pilot Code's per-system queue interacting with the tick loop) wherever
that seam carries real risk of silent breakage. Because Principle II's
guarantees are only as real as their test coverage, sandbox escape
attempts (infinite loops, memory exhaustion, forbidden API access,
timing side-channels where practical) MUST have adversarial tests
proving the sandbox contains or kills them. Battle simulation MUST
have determinism tests: the same stored build + code + seed MUST
reproduce byte-identical results and replays on repeated runs. One
end-to-end test MUST cover the full vertical slice (build a tank →
submit code → battle a boss → view result and replay). GitHub Actions
CI MUST run typecheck, lint, test, and e2e on every push, and MUST be
green before merge.

Rationale: coverage of the logic that silently breaks fairness or
safety (sandbox limits, determinism) matters more here than ceremony
around write-order; strict test-before-code is not enforced, but the
adversarial/determinism tests specifically are non-negotiable given
Principle II, and unit/integration/e2e coverage generally is the
expected default everywhere else, not an aspiration.

### VI. Legible History

Commits MUST use Conventional Commits prefixes (`feat`, `fix`, `docs`,
`test`, `chore`, `refactor`) and each commit MUST be one logical,
atomic, self-contained change, mapped to a `tasks.md` item where
practical — committing mid-task is fine where it makes sense, rather
than batching everything into one commit at the end. After each unit of
work, `CHANGELOG.md` and `status.md` MUST be updated to match (and any
ADR the work triggered MUST be written or updated), and the result
committed — not left staged for later. Trivial changes (typo fixes,
formatting) don't need a `CHANGELOG.md`/`status.md` entry, but still
get committed.

Rationale: legible history is how a solo maintainer safely picks this
back up later, and — carried over from prior projects where this habit
proved itself — keeps `status.md`/`CHANGELOG.md` a trustworthy live
read of where things stand rather than a document perpetually behind
the actual code.

## Technology Constraints

Next.js (App Router) with TypeScript in strict mode; Tailwind CSS for
styling; npm as the package manager. A component layer may use
shadcn/ui only as a restyled base — components MUST NOT ship at default
appearance (see Principle III). Persistence is a real, durable database
from day one (tank builds/code versions, match history against the AI
opponent) — PostgreSQL, queried through Drizzle, following the pattern
validated on prior projects; ADR owed. Match replays (tick-by-tick
event logs) are likely large, append-only, and rarely queried
relationally — candidate for object storage (e.g. Vercel Blob) rather
than DB rows; ADR owed.

Sandbox execution for player-submitted code: **decided — an embedded
WASM JS interpreter** (e.g. QuickJS-via-WASM), run in-process inside a
normal server function, with step-count/memory budgets enforced per
tick (wall-clock time deliberately not the metric, to stay
hardware-independent for replay determinism — see Principle V).
Chosen over Vercel Sandbox (isolated microVM): a microVM fits running
occasional heavyweight arbitrary code, not calling a narrow, tiny
function thousands of times per match (`pilotCode` runs once per tick,
per tank, up to ~3,000 ticks); using it well would mean running the
whole tick-simulation loop inside the sandbox rather than in code this
project owns. WASM is also portable bytecode rather than a native
addon (unlike the also-considered `isolated-vm`), so it carries no
architecture/ABI-matching risk on Vercel's serverless build pipeline.
Accepted tradeoffs: QuickJS is an interpreter, not JIT-compiled — a
non-issue since matches are queued and simulated whenever server
resources are available rather than on a real-time deadline; and
cross-boundary host-function marshaling (exposing the tank API to
sandboxed code) is real, hand-written integration work, not a
turnkey feature. A WASM memory-exhaustion ceiling is a distinct
resource from the step-count budget and needs its own handling,
likely mirroring the step-budget's three-consecutive-violations
forfeit rule — not yet finalized. A standalone `docs/adr/` file
formalizing this reasoning is still owed per Principle I; this
paragraph is the decision of record until then. Principle II's other
guarantees (no network/filesystem access, resource limits, determinism,
forward-compatibility with a future sandboxed second combatant) apply
regardless.

Auth: v1 defaults to single-owner, no login — there is no opponent
player to authenticate against yet, and this keeps the MVP realistically
scoped per Principle IV. This is a default, not a final decision: revisit
when async PvP work begins, at which point multi-user accounts become
necessary and a provider (Clerk vs. Auth.js vs. other) is TBD, ADR owed
at that time.

The v1 scripted bosses (ten, one per ladder rank) are project-authored,
deterministic logic — not an LLM, not player-submitted — so none of
them are themselves sandboxed (see Principle II), but each one's action
budget per tick MUST be bounded equivalently to a sandboxed player
tank. No LLM/AI provider is part of the MVP; if an LLM-driven opponent
or practice partner is explored later, any model-driven behavior MUST
follow Principle II's sandboxing requirements just like player code,
plus Zod-validated boundaries for any external calls.

## Development Workflow

Spec Kit phases are worked in order: constitution → spec → plan → tasks
→ implement. Clarifying questions are asked before each major artifact
is generated. Decisions with a real tradeoff are presented as 2–3
options with pros/cons and a recommendation, rather than silently
decided. Given the MVP scope defined in Principle IV, tasks are
sequenced into demoable increments and sized realistically during
`/speckit-plan` and `/speckit-tasks`. Once the MVP feature list exists,
every feature MUST be fully specified, planned, and tasked before
implementation begins on any of them — infrastructure-only setup (e.g.
the initial project scaffold, sandbox spike/prototype to de-risk
Principle II before committing to an approach) is built immediately as
a stated exception, since it isn't product surface — unless the
project owner explicitly asks to implement something sooner.

## Governance

This constitution supersedes all other project practices. Amendments
require a documented Sync Impact Report (prepended to this file)
recording the version change, modified/added/removed sections, and any
templates flagged for follow-up.

Constitution versioning follows semantic versioning:
- **MAJOR**: backward-incompatible governance or principle removals/
  redefinitions.
- **MINOR**: a new principle or section added, or materially expanded
  guidance.
- **PATCH**: clarifications, wording, or non-semantic refinements.

Every `/speckit-plan` run MUST include a Constitution Check gate against
the principles above, and every `tasks.md` MUST be traceable back to
them. Any complexity that appears to violate a principle — especially
Principle IV (Scope Discipline) — MUST be justified in the plan's
Complexity Tracking table or rejected.

Reference material from prior projects — t@nk.r's own draft
constitution (a fuller multiplayer-ranking MVP that this project
restarts from, at a deliberately smaller v1 scope), and before it
PrintingSite's process discipline (spec-driven workflow, ADR habit,
test discipline, changelog/status.md conventions) — was used as a
structural starting point for this project's process, but MUST NOT be
treated as this project's own authored decisions — per Principle I,
this project's committed ADRs, specs, and plans are authored (or
substantively reconciled) through this project's own process, so the
"process produced this" record stays genuine.

**Version**: 0.2.0-draft (DRAFT — not yet ratified) | **Ratified**:
TODO(RATIFICATION_DATE) — pending explicit user approval | **Last
Amended**: 2026-07-11
