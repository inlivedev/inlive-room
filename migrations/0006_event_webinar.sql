CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text,
	"start_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events_to_participant" (
	"event_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	CONSTRAINT events_to_participant_event_id_participant_id PRIMARY KEY("event_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events_participant" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"client_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pass_code" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_to_participant" ADD CONSTRAINT "events_to_participant_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_to_participant" ADD CONSTRAINT "events_to_participant_participant_id_events_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "events_participant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
