import { relations } from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Data model per specs/001-core-battle-loop/data-model.md.
 * Single-owner/no-login for v1 (spec Assumptions) -- pilotProfiles has
 * exactly one seeded row for now, but the shape doesn't preclude more.
 */

export const opponentKind = pgEnum("opponent_kind", ["boss", "challenger"]);
export const battleStatus = pgEnum("battle_status", ["queued", "simulating", "complete"]);
export const battleOutcome = pgEnum("battle_outcome", ["win", "loss"]);

export const pilotProfiles = pgTable("pilot_profiles", {
  id: serial("id").primaryKey(),
  rank: integer("rank").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tankBuilds = pgTable("tank_builds", {
  id: serial("id").primaryKey(),
  pilotProfileId: integer("pilot_profile_id")
    .notNull()
    .references(() => pilotProfiles.id),
  name: text("name").notNull(),
  chassisTier: integer("chassis_tier").notNull(),
  weaponTier: integer("weapon_tier").notNull(),
  sensorTier: integer("sensor_tier").notNull(),
  mobilityTier: integer("mobility_tier").notNull(),
  powerTier: integer("power_tier").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pilotCodePrograms = pgTable("pilot_code_programs", {
  id: serial("id").primaryKey(),
  pilotProfileId: integer("pilot_profile_id")
    .notNull()
    .references(() => pilotProfiles.id),
  name: text("name").notNull(),
  sourceCode: text("source_code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Project-authored opponent definitions -- seed/reference data, not
 * player-editable. Exactly 1 boss + 3 challengers per rank tier
 * (spec FR-025, FR-029).
 */
export const opponents = pgTable("opponents", {
  id: serial("id").primaryKey(),
  rankTier: integer("rank_tier").notNull(),
  kind: opponentKind("kind").notNull(),
  name: text("name").notNull(),
  chassisTier: integer("chassis_tier").notNull(),
  weaponTier: integer("weapon_tier").notNull(),
  sensorTier: integer("sensor_tier").notNull(),
  mobilityTier: integer("mobility_tier").notNull(),
  powerTier: integer("power_tier").notNull(),
  /** Module identifier under src/engine/opponents/, not player data. */
  behaviorModule: text("behavior_module").notNull(),
});

/**
 * Snapshots the build/program used, rather than live-referencing
 * tankBuilds/pilotCodePrograms -- a player editing a saved build or
 * program after a battle MUST NOT change that battle's already-
 * recorded result or replay (data-model.md).
 */
export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  pilotProfileId: integer("pilot_profile_id")
    .notNull()
    .references(() => pilotProfiles.id),
  opponentId: integer("opponent_id")
    .notNull()
    .references(() => opponents.id),
  buildSnapshot: jsonb("build_snapshot").notNull(),
  programSourceSnapshot: text("program_source_snapshot").notNull(),
  seed: text("seed").notNull(),
  status: battleStatus("status").notNull().default("queued"),
  outcome: battleOutcome("outcome"),
  finalTick: integer("final_tick"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  simulatedAt: timestamp("simulated_at"),
});

/** 1:1 with battles -- the tick-by-tick replay source (ADR 0003). */
export const battleLogs = pgTable("battle_logs", {
  battleId: integer("battle_id")
    .primaryKey()
    .references(() => battles.id),
  tickLog: jsonb("tick_log").notNull(),
});

export const pilotProfilesRelations = relations(pilotProfiles, ({ many }) => ({
  builds: many(tankBuilds),
  programs: many(pilotCodePrograms),
  battles: many(battles),
}));

export const tankBuildsRelations = relations(tankBuilds, ({ one }) => ({
  pilotProfile: one(pilotProfiles, { fields: [tankBuilds.pilotProfileId], references: [pilotProfiles.id] }),
}));

export const pilotCodeProgramsRelations = relations(pilotCodePrograms, ({ one }) => ({
  pilotProfile: one(pilotProfiles, { fields: [pilotCodePrograms.pilotProfileId], references: [pilotProfiles.id] }),
}));

export const opponentsRelations = relations(opponents, ({ many }) => ({
  battles: many(battles),
}));

export const battlesRelations = relations(battles, ({ one }) => ({
  pilotProfile: one(pilotProfiles, { fields: [battles.pilotProfileId], references: [pilotProfiles.id] }),
  opponent: one(opponents, { fields: [battles.opponentId], references: [opponents.id] }),
  log: one(battleLogs, { fields: [battles.id], references: [battleLogs.battleId] }),
}));

export const battleLogsRelations = relations(battleLogs, ({ one }) => ({
  battle: one(battles, { fields: [battleLogs.battleId], references: [battles.id] }),
}));
