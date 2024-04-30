CREATE TABLE IF NOT EXISTS "participant_role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);

INSERT INTO "participant_role" ("id","name") VALUES (2,'host');
INSERT INTO "participant_role" ("id","name") VALUES (1,'viewer');

--> statement-breakpoint
DO $$
BEGIN
    BEGIN
        ALTER TABLE "events_participant" ADD COLUMN "role_id" integer;
    EXCEPTION WHEN duplicate_column THEN
        -- handle the error
    END;
    BEGIN
        ALTER TABLE "events_participant" ADD CONSTRAINT "events_participant_role_id_participant_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "participant_role"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
        -- handle the error
    END;
END;
$$;

UPDATE "events_participant" SET "role_id" = 1 WHERE "role_id" IS NULL;

ALTER TABLE "events_participant" ALTER COLUMN "role_id" SET NOT NULL;
-- Add Host into Participant Table
INSERT INTO "events_participant" ("event_id","email","role_id","first_name","last_name","client_id") 
SELECT e.id , u.email, 2, u.name, '' ,(LEFT(md5(gen_random_uuid()::text), 12))
FROM "events" e
JOIN "users" u ON e.created_by = u.id
WHERE NOT EXISTS (
    SELECT 1
    FROM "events_participant" ep
    WHERE ep.email = u.email AND ep.event_id = e.id 
);