CREATE TABLE IF NOT EXISTS "event_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);

INSERT INTO "event_category" ("id","name") VALUES (1,'webinar');
INSERT INTO "event_category" ("id","name") VALUES (2,'meetings');

--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "category_id" integer;
UPDATE "events" set "category_id" = 1 where "category_id" IS NULL;

ALTER TABLE "events_participant" ADD COLUMN "is_invited" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_category_id_event_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "event_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "events" ALTER COLUMN "category_id" SET NOT NULL
