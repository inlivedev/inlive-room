ALTER TABLE "events" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;