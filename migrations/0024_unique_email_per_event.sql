
-- Remove duplicate email registered into the same event
DELETE FROM "events_participant" ep1 
USING "events_participant" ep2
WHERE ep1.email = ep2.email 
  AND ep1.event_id = ep2.event_id 
  AND ep1.id > ep2.id;

DO $$
BEGIN
    BEGIN
        ALTER TABLE "events_participant" ADD CONSTRAINT "events_participant_email_event_id_unique" UNIQUE("email","event_id");
    EXCEPTION WHEN duplicate_object THEN
        -- handle the error
    END;
END;
$$;