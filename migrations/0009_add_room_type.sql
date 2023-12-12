ALTER TABLE "rooms" ADD COLUMN "meta" jsonb;

UPDATE "rooms" 
SET meta = '{"type":"meeting"}'::jsonb 
WHERE meta IS NULL;

DO $$ 
DECLARE 
    roomID text;
    events RECORD;
BEGIN
    FOR events IN SELECT room_id FROM events 
    LOOP
        roomID := events.room_id;
        UPDATE rooms SET meta = '{"type" : "event"}'::json WHERE id = roomID;
    END LOOP;
END $$;