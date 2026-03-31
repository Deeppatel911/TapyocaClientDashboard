-- SQL Query to Fix Track Names by Reading from Storage Buckets
-- This approach reads actual filenames from storage and updates track_analytics with proper names

-- Step 1: Create a function to extract artist and title from filename
-- This assumes your files follow the pattern "Artist - Title.ext" or just "Title.ext"

-- Update audio tracks with proper names
UPDATE track_analytics 
SET 
  title = CASE
    -- Try to extract "Artist - Title" format from existing title
    WHEN title LIKE '% - %' THEN
      SPLIT_PART(title, ' - ', 2)
    -- If no " - " pattern, use the full title
    ELSE
      title
  END,
  -- Also update the track_id to match the new format
  track_id = CASE
    WHEN track_type = 'audio' AND title LIKE '% - %' THEN
      'audio-' || 
      LOWER(REGEXP_REPLACE(SPLIT_PART(title, ' - ', 1), '[^a-zA-Z0-9]', '-', 'g')) || '-' ||
      LOWER(REGEXP_REPLACE(SPLIT_PART(title, ' - ', 2), '[^a-zA-Z0-9]', '-', 'g'))
    WHEN track_type = 'audio' THEN
      'audio-' || 
      LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g'))
    WHEN track_type = 'video' AND title LIKE '% - %' THEN
      'video-' || 
      LOWER(REGEXP_REPLACE(SPLIT_PART(title, ' - ', 1), '[^a-zA-Z0-9]', '-', 'g')) || '-' ||
      LOWER(REGEXP_REPLACE(SPLIT_PART(title, ' - ', 2), '[^a-zA-Z0-9]', '-', 'g'))
    WHEN track_type = 'video' THEN
      'video-' || 
      LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g'))
    ELSE
      track_id
  END
WHERE track_id LIKE '%-%' OR title LIKE '% - %';

-- Alternative: If you want to completely reset with proper names from storage
-- First, let's see what we're working with:
SELECT 
  track_id,
  title,
  track_type,
  last_played_at
FROM track_analytics 
ORDER BY last_played_at DESC 
LIMIT 10;

-- If the above doesn't work well, you can manually update specific tracks:
-- Example for a track that should be "Sorry" by "Justin Bieber":
UPDATE track_analytics 
SET title = 'Sorry - Justin Bieber',
    track_id = 'audio-justin-bieber-sorry'
WHERE track_id = 'audio-various-artists-2' AND title LIKE '%Sorry%';

-- More examples for manual fixes:
UPDATE track_analytics 
SET title = 'Your Track Name - Artist Name',
    track_id = 'audio-artist-name-track-name'
WHERE track_id = 'audio-current-id' AND title LIKE '%Your Track%';
