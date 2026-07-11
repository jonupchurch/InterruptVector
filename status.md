# Status

**Phase**: Constitution drafted, not yet ratified.
**Last updated**: 2026-07-11

## Where things stand

- Constitution v0.1.0-draft is written: full restart of t@nk.r under
  the name Interrupt Vector, rescoped v1 = one player tank vs. one
  fixed scripted AI opponent, server-side deterministic simulation,
  replay-only (no live spectating), no multiplayer/auth/ranking yet.
- Async PvP is the stated future direction; the sandbox architecture is
  required to leave room for it without a rewrite.
- No spec, plan, tasks, or application code exist yet.
- A design-system reference (`resources/overview.html`) has been added.
- Decisions still open, flagged as ADR-owed in the constitution:
  sandbox execution tech (WASM interpreter vs. Vercel Sandbox), replay
  storage, auth provider (deferred until PvP work begins).

## Next up

- User review/ratification of the constitution.
- `/speckit-specify` to write the MVP spec.

## Blockers

- None.
