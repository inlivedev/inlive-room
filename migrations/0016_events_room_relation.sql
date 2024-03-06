ALTER TABLE "events" ALTER COLUMN "room_id" DROP NOT NULL;--> statement-breakpoint


-- Create missing room records from the events table
INSERT INTO rooms (id, created_by, meta)
SELECT e.room_id, e.created_by, '{"type": "event"}'::json
FROM events e
LEFT JOIN rooms r ON e.room_id = r.id
WHERE r.id IS NULL;

DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
