CREATE TABLE IF NOT EXISTS "invitees" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"whitelist_feature" text[] DEFAULT array[]::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitees_email_unique" UNIQUE("email")
);
