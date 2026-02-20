-- Create artists table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  folder_name TEXT UNIQUE, -- Links to Supabase storage folder
  bio TEXT,
  image_url TEXT,
  spotify_url TEXT,
  youtube_url TEXT,
  apple_music_url TEXT,
  official_website TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artist_links table for multiple links per artist
CREATE TABLE artist_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'spotify', 'youtube', 'apple_music', 'website', etc.
  url TEXT NOT NULL,
  display_name TEXT,
  icon TEXT, -- emoji or icon name
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for artists
CREATE POLICY "Anyone can view artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert artists" ON artists FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update artists" ON artists FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete artists" ON artists FOR DELETE USING (auth.role() = 'authenticated');

-- RLS policies for artist_links
CREATE POLICY "Anyone can view artist links" ON artist_links FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert artist links" ON artist_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update artist links" ON artist_links FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete artist links" ON artist_links FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes for better performance
CREATE INDEX idx_artists_folder_name ON artists(folder_name);
CREATE INDEX idx_artist_links_artist_id ON artist_links(artist_id);
CREATE INDEX idx_artist_links_active ON artist_links(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE
    ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
