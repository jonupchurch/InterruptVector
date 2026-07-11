# Interrupt Vector

> Program a tank. Fight a machine. Watch the replay.

A hobby project in the spirit of *Omega* (1989): build a tank from a
small parts catalog, write code against its sensor/action API, and let
it fight — sandboxed, deterministic, replayable.

This is a full restart of a prior project, **t@nk.r**, rescoped to a
smaller v1: one player-built tank vs. one fixed, non-learning scripted
AI opponent, with async PvP as a future direction rather than an MVP
requirement. See the constitution's provenance note for the full story.

## Status

This project is in the **constitution** phase of a spec-driven build.
No spec, plan, or application code exists yet. See
[status.md](status.md) for the live state of things and
[CHANGELOG.md](CHANGELOG.md) for what's shipped so far.

## The problem / the idea

Writing a program that controls a tank — reading sensors, deciding when
to move, turn, and fire — and watching it fight is a satisfying, self-
contained programming puzzle. The MVP is one full vertical slice of
that loop: build a tank → write its code → submit it → watch it battle
a scripted opponent → view the result and a full replay. Multiplayer,
ranking, and matchmaking come later, once that loop is solid.

## Architecture decisions

No ADRs yet. The first is expected once `/speckit-plan` picks a sandbox
execution model for player-submitted tank code (see the constitution's
Technology Constraints section for the candidates under evaluation).

## Process

This repo follows [GitHub Spec Kit](https://github.com/github/spec-kit)'s
spec-driven workflow — constitution → spec → plan → tasks → implement —
governed by the [project constitution](.specify/memory/constitution.md).

## Running this project

The app is scaffolded (Next.js App Router, TypeScript strict, Tailwind
CSS, Zod, Drizzle ORM, Vitest, Playwright) but has no product features
yet — this is infrastructure only, per the constitution's stated
exception for initial scaffolding.

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL
npm run dev                  # http://localhost:3000
npm run typecheck
npm run lint
npm run test                 # vitest
npm run test:e2e             # playwright
npm run build
```

Drizzle config lives in `drizzle.config.ts` / `src/db/`; the schema is
currently empty pending the data-model ADR (see `status.md`).
