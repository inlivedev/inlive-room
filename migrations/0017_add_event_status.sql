DO $$ BEGIN
 CREATE TYPE "event_status_enum" AS ENUM('draft', 'published', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" "event_status_enum" DEFAULT 'draft' NOT NULL;--> statement-breakpoint

SET status = CASE
                WHEN is_published = false THEN 'draft'::status_enum
                WHEN is_published = true THEN 'published'::status_enum
            END;

ALTER TABLE "events" DROP COLUMN IF EXISTS "is_published";