ALTER TABLE scanned_emails
  ADD COLUMN IF NOT EXISTS ambassador_id integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'scanned_emails_ambassador_id_fkey'
      AND table_name = 'scanned_emails'
  ) THEN
    ALTER TABLE scanned_emails
      ADD CONSTRAINT scanned_emails_ambassador_id_fkey
      FOREIGN KEY (ambassador_id) REFERENCES ambassadors(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ix_scanned_emails_ambassador_id
  ON scanned_emails (ambassador_id);

ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS university character varying(255);

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS club_name character varying(255),
  ADD COLUMN IF NOT EXISTS club_names text[],
  ADD COLUMN IF NOT EXISTS start_iso character varying(50),
  ADD COLUMN IF NOT EXISTS end_iso character varying(50),
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS event_url text,
  ADD COLUMN IF NOT EXISTS directions_video_url text,
  ADD COLUMN IF NOT EXISTS university character varying(255),
  ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS source character varying(20) DEFAULT 'scanned',
  ADD COLUMN IF NOT EXISTS posted_by character varying(255),
  ADD COLUMN IF NOT EXISTS reviewed_by character varying(255),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp without time zone,
  ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

UPDATE events
SET club_name = club
WHERE club_name IS NULL
  AND club IS NOT NULL;

UPDATE events
SET club_names = ARRAY[club]
WHERE club_names IS NULL
  AND club IS NOT NULL;

UPDATE events
SET start_iso = CASE
  WHEN event_date IS NOT NULL AND event_time IS NOT NULL THEN
    to_char((event_date::timestamp + event_time), 'YYYY-MM-DD"T"HH24:MI:SS')
  WHEN event_date IS NOT NULL THEN
    to_char(event_date::timestamp, 'YYYY-MM-DD"T"HH24:MI:SS')
  ELSE start_iso
END
WHERE start_iso IS NULL;

UPDATE events
SET end_iso = CASE
  WHEN event_date IS NOT NULL AND event_time IS NOT NULL THEN
    to_char((event_date::timestamp + event_time + interval '1 hour'), 'YYYY-MM-DD"T"HH24:MI:SS')
  WHEN event_date IS NOT NULL THEN
    to_char((event_date::timestamp + interval '1 hour'), 'YYYY-MM-DD"T"HH24:MI:SS')
  ELSE end_iso
END
WHERE end_iso IS NULL;

UPDATE events
SET source = 'scanned'
WHERE source IS NULL;

UPDATE events
SET status = 'approved'
WHERE status IS NULL;

UPDATE events
SET updated_at = COALESCE(updated_at, created_at, now())
WHERE updated_at IS NULL;
