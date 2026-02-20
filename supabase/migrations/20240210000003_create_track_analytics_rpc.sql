-- Create RPC function to get track analytics without UUID validation
CREATE OR REPLACE FUNCTION get_track_analytics(
  p_track_id TEXT,
  p_track_type TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  track_id TEXT,
  track_type TEXT,
  user_id UUID,
  title TEXT,
  play_count INTEGER,
  skip_count INTEGER,
  avg_listen_duration INTEGER,
  completion_rate INTEGER,
  total_listen_time INTEGER,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  album_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.id,
    ta.track_id,
    ta.track_type,
    ta.user_id,
    ta.title,
    ta.play_count,
    ta.skip_count,
    ta.avg_listen_duration,
    ta.completion_rate,
    ta.total_listen_time,
    ta.last_played_at,
    ta.created_at,
    ta.updated_at,
    ta.album_id
  FROM track_analytics ta
  WHERE 
    ta.track_id = p_track_id
    AND ta.track_type = p_track_type
    AND ta.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
