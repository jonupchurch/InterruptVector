ALTER TYPE "public"."battle_status" ADD VALUE 'failed';--> statement-breakpoint
ALTER TABLE "battles" ADD COLUMN "error_message" text;