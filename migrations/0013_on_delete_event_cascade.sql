ALTER TABLE "events_to_participant" DROP CONSTRAINT "events_to_participant_event_id_events_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_to_participant" ADD CONSTRAINT "events_to_participant_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
