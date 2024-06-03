ALTER TYPE "event_status_enum" ADD VALUE 'completed';

UPDATE "event" SET "status" = 'completed' WHERE "end_time" < NOW() AND "status" = 'published';