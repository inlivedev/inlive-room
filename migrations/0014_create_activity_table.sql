CREATE TABLE IF NOT EXISTS "activities_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"meta" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer
);
