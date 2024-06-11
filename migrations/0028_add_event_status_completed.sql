DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'event_status_enum' AND e.enumlabel = 'completed') THEN
        ALTER TYPE "event_status_enum" ADD VALUE 'completed';
    END IF;
END
$$;

UPDATE "events" SET "status" = 'completed' WHERE "end_time" < NOW() AND "status" = 'published';