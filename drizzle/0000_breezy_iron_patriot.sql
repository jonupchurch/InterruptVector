CREATE TYPE "public"."battle_outcome" AS ENUM('win', 'loss');--> statement-breakpoint
CREATE TYPE "public"."battle_status" AS ENUM('queued', 'simulating', 'complete');--> statement-breakpoint
CREATE TYPE "public"."opponent_kind" AS ENUM('boss', 'challenger');--> statement-breakpoint
CREATE TABLE "battle_logs" (
	"battle_id" integer PRIMARY KEY NOT NULL,
	"tick_log" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battles" (
	"id" serial PRIMARY KEY NOT NULL,
	"pilot_profile_id" integer NOT NULL,
	"opponent_id" integer NOT NULL,
	"build_snapshot" jsonb NOT NULL,
	"program_source_snapshot" text NOT NULL,
	"seed" text NOT NULL,
	"status" "battle_status" DEFAULT 'queued' NOT NULL,
	"outcome" "battle_outcome",
	"final_tick" integer,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"simulated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "opponents" (
	"id" serial PRIMARY KEY NOT NULL,
	"rank_tier" integer NOT NULL,
	"kind" "opponent_kind" NOT NULL,
	"name" text NOT NULL,
	"chassis_tier" integer NOT NULL,
	"weapon_tier" integer NOT NULL,
	"sensor_tier" integer NOT NULL,
	"mobility_tier" integer NOT NULL,
	"power_tier" integer NOT NULL,
	"behavior_module" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_code_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pilot_profile_id" integer NOT NULL,
	"name" text NOT NULL,
	"source_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"rank" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tank_builds" (
	"id" serial PRIMARY KEY NOT NULL,
	"pilot_profile_id" integer NOT NULL,
	"name" text NOT NULL,
	"chassis_tier" integer NOT NULL,
	"weapon_tier" integer NOT NULL,
	"sensor_tier" integer NOT NULL,
	"mobility_tier" integer NOT NULL,
	"power_tier" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "battle_logs" ADD CONSTRAINT "battle_logs_battle_id_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_pilot_profile_id_pilot_profiles_id_fk" FOREIGN KEY ("pilot_profile_id") REFERENCES "public"."pilot_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_opponent_id_opponents_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."opponents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_code_programs" ADD CONSTRAINT "pilot_code_programs_pilot_profile_id_pilot_profiles_id_fk" FOREIGN KEY ("pilot_profile_id") REFERENCES "public"."pilot_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tank_builds" ADD CONSTRAINT "tank_builds_pilot_profile_id_pilot_profiles_id_fk" FOREIGN KEY ("pilot_profile_id") REFERENCES "public"."pilot_profiles"("id") ON DELETE no action ON UPDATE no action;