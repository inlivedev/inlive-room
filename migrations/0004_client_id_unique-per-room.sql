ALTER TABLE "participants" DROP CONSTRAINT "participants_pkey";--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_id_room_id" PRIMARY KEY("id","room_id");