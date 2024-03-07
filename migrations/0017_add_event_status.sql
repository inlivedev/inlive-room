DO $$ BEGIN
 CREATE TYPE "event_status_enum" AS ENUM('draft', 'published', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "status" "event_status_enum" DEFAULT 'draft' NOT NULL;--> statement-breakpoint

UPDATE "events" 
SET status = CASE
                WHEN is_published = false THEN 'draft'::event_status_enum
                WHEN is_published = true THEN 'published'::event_status_enum
            END;

ALTER TABLE "events" DROP COLUMN IF EXISTS "is_published";