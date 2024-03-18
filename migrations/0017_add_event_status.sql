DO $$ BEGIN
 CREATE TYPE "event_status_enum" AS ENUM('draft', 'published', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "status" "event_status_enum" DEFAULT 'draft' NOT NULL;--> statement-breakpoint

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'events' 
        AND column_name = 'is_published'
    ) THEN
        UPDATE your_table_name
        SET status = CASE
                        WHEN is_published = false THEN 'draft'::event_status_enum
                        WHEN is_published = true THEN 'published'::event_status_enum
                    END;
    ELSE
        RAISE NOTICE 'Column "is_published" does not exist in the table.';
    END IF;
END $$;


ALTER TABLE "events" DROP COLUMN IF EXISTS "is_published";