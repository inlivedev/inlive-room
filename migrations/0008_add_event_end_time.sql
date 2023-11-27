ALTER TABLE events
ADD COLUMN end_time TIMESTAMP;

UPDATE events
SET end_time = start_time + INTERVAL '1 hour'
WHERE end_time IS NULL;

ALTER TABLE events
ALTER COLUMN end_time SET NOT NULL;
