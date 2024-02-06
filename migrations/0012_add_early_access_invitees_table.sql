CREATE TABLE IF NOT EXISTS "early_access_invitees" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"whitelist_feature" text[] DEFAULT array[]::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "early_access_invitees_email_unique" UNIQUE("email")
);
