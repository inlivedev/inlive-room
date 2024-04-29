WITH duplicates_email_cte AS (
    SELECT 
        event_id,
        email,
        ROW_NUMBER() OVER (PARTITION BY event_id, email ORDER BY event_id) AS row_num
    FROM 
        events_participant
)
DELETE FROM 
    events_participant
WHERE 
    (event_id, email) IN (
        SELECT 
            event_id,
            email
        FROM 
            duplicates_email_cte
        WHERE 
            row_num > 1
    );

ALTER TABLE "events_participant" ADD CONSTRAINT "events_participant_email_event_id_unique" UNIQUE("email","event_id");