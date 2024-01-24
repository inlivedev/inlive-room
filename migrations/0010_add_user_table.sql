CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"picture_url" text,
	"whitelist_feature" text[] DEFAULT array[]::text[] NOT NULL,
	"account_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "events_to_participant" DROP CONSTRAINT "events_to_participant_event_id_participant_id";--> statement-breakpoint
ALTER TABLE "events_to_participant" ADD CONSTRAINT "events_to_participant_event_id_participant_id_pk" PRIMARY KEY("event_id","participant_id");