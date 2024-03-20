-- Enable pgcrypto for gen_random_uuid() function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "events" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "uuid" uuid DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "update_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- Add foreign key constraint to events.created_by
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "host";