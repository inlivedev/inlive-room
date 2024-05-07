DO $$
BEGIN
    BEGIN
        ALTER TABLE "events" ADD COLUMN "available_slots" integer DEFAULT 50;
    EXCEPTION WHEN duplicate_column THEN
        -- handle the error
    END;
END;
$$;