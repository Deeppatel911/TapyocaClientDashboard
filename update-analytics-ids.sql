-- SQL Query to Update Track Analytics with New ID Format
-- This will update existing analytics records to match the new track ID format

-- First, let's see what we're working with
SELECT track_id, title, track_type FROM track_analytics ORDER BY created_at DESC LIMIT 10;

-- Update audio track analytics to use proper track names instead of indices
-- This assumes your audio files follow the pattern "Artist - Title.mp3"
UPDATE track_analytics 
SET track_id = 
  CASE 
    -- Extract artist and title from the title field if it contains " - "
    WHEN title LIKE '% - %' THEN
      'audio-' || 
      LOWER(REGEXP_REPLACE(SPLIT_PART(title, ' - ', 1), '[^a-zA-Z0-9]', '-', 'g')) || '-' ||
      LOWER(REGEXP_REPLACE(SPLIT_PART(title, ' - ', 2), '[^a-zA-Z0-9]', '-', 'g'))
    -- If no " - " pattern, use the full title
    ELSE
      'audio-' || 
      LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g'))
  END
WHERE track_type = 'audio' AND track_id LIKE 'audio-%-%';

-- Update video track analytics to use proper track names instead of indices
UPDATE track_analytics 
SET track_id = 
  CASE 
    -- Extract artist and title from the title field if it contains " - "
    WHEN title LIKE '% - %' THEN
      'video-' || 
      LOWER(REGEXP_REPLACE(SPLIT_PART(title, ' - ', 1), '[^a-zA-Z0-9]', '-', 'g')) || '-' ||
      LOWER(REGEXP_REPLACE(SPLIT_PART(title, ' - ', 2), '[^a-zA-Z0-9]', '-', 'g'))
    -- If no " - " pattern, use the full title
    ELSE
      'video-' || 
      LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g'))
  END
WHERE track_type = 'video' AND track_id LIKE 'video-%-%';

-- Clean up any double dashes that might result from the replacement
UPDATE track_analytics 
SET track_id = REGEXP_REPLACE(track_id, '-+', '-', 'g')
WHERE track_id LIKE '%--%';

-- Remove any leading/trailing dashes
UPDATE track_analytics 
SET track_id = TRIM(BOTH '-' FROM track_id)
WHERE track_id LIKE '-%' OR track_id LIKE '%-';

-- Verify the changes
SELECT track_id, title, track_type FROM track_analytics ORDER BY created_at DESC LIMIT 10;

-- Optional: If you want to completely reset and start fresh
-- DELETE FROM track_analytics;
-- This will remove all existing analytics and start fresh with the new ID format
