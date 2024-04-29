CREATE TABLE IF NOT EXISTS "participant_role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events_participant" ADD COLUMN "role_id" integer;--> statement-breakpoint
UPDATE "events_participant" SET "role_id" = 1 WHERE "role_id" IS NULL;

DO $$ BEGIN
 ALTER TABLE "events_participant" ADD CONSTRAINT "events_participant_role_id_participant_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "participant_role"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Todo : Migration 

INSERT INTO "participant_role" ("id","name") VALUES (2,'host');
INSERT INTO "participant_role" ("id","name") VALUES (1,'viewer');


ALTER TABLE "events_participant" ALTER COLUMN "role_id" SET NOT NULL;