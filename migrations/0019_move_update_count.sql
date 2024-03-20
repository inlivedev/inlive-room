ALTER TABLE "events_participant" ADD COLUMN "update_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "update_count";