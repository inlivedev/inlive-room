CREATE TABLE IF NOT EXISTS "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"room_id" text NOT NULL,
	"user_id" integer NOT NULL
);
