-- Add event_id and join_id to the events_participant table
ALTER TABLE "events_participant" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "events_participant" ADD COLUMN "join_id" char(12);--> statement-breakpoint

-- Add unique constraint for client_id and event_id (when combined must unique)
ALTER TABLE "events_participant" ADD CONSTRAINT "events_participant_client_id_event_id_unique" UNIQUE("client_id","event_id"); 

-- remove unused data column from events_participant
ALTER TABLE "events_participant" DROP COLUMN IF EXISTS "data";--> statement-breakpoint

-- Add event_id to the events_participant table before removing the junction table
UPDATE events_participant ep
SET event_id = etp.event_id
FROM "events_to_participant" etp
WHERE ep.id = etp.participant_id
AND ep.event_id IS NULL;

-- Generate join_id for existing participants
UPDATE "events_participant" 
SET join_id = (LEFT(md5(gen_random_uuid()::text), 12))
WHERE "events_participant".join_id IS NULL;

-- add foreign key constraint for event_id
DO $$ BEGIN
 ALTER TABLE "events_participant" ADD CONSTRAINT "events_participant_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Add not null constraints for event_id and join_id
ALTER TABLE "events_participant" ALTER COLUMN "event_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events_participant" ALTER COLUMN "join_id" SET NOT NULL;--> statement-breakpoint

-- Drop the junction table
DROP TABLE "events_to_participant";--> statement-breakpoint
