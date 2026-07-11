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
- No spec, plan, or tasks exist yet. Initial project scaffold has been
  built ahead of them, per the constitution's stated exception for
  infrastructure-only setup:
  - Next.js (App Router) + TypeScript strict + Tailwind CSS, via
    `create-next-app`, `src/` layout, `@/*` import alias.
  - Zod (`src/env.ts` validates `DATABASE_URL` at startup) and Drizzle
    ORM against Postgres (`src/db/`, `drizzle.config.ts`), using the
    `postgres` (postgres.js) driver — a default choice, not yet the
    ADR-owed final decision.
  - Vitest (unit, jsdom + Testing Library) and Playwright (e2e,
    chromium) are wired up with one smoke test each, standing in for
    Principle V's required coverage until real logic/flows exist.
  - `.env.example` / `.env.local` added (`DATABASE_URL` only for now).
- `src/db/schema.ts` is intentionally empty — no data model decisions
  have been made; tables land once `/speckit-plan` produces the
  persistence ADR.
- A design-system reference (`resources/overview.html`) has been added;
  the scaffolded homepage is still the unstyled `create-next-app`
  default (Principle III's distinctive-identity bar applies once real
  UI work starts, not to this placeholder).
- Decisions still open, flagged as ADR-owed in the constitution:
  sandbox execution tech (WASM interpreter vs. Vercel Sandbox), replay
  storage, auth provider (deferred until PvP work begins), and now also
  the Postgres driver choice (`postgres` vs `pg` vs a provider-specific
  serverless driver).

## Next up

- User review/ratification of the constitution.
- `/speckit-specify` to write the MVP spec.
- Fill in a real `DATABASE_URL` in `.env.local` to start using Drizzle.

## Blockers

- None.
