import { useState, useEffect } from 'react';

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
}

export const useAudioMetadata = (audioUrl: string, fileName?: string) => {
  const [metadata, setMetadata] = useState<AudioMetadata>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;

    const extractMetadata = async () => {
      setIsLoading(true);
      try {
        // Create audio element to extract basic metadata
        const audio = new Audio(audioUrl);
        
        // Parse filename for artist/title if available
        let parsedArtist = 'Unknown Artist';
        let parsedTitle = fileName?.replace(/\.[^/.]+$/, '') || 'Unknown Track';
        
        // Try to extract artist from filename format "Artist - Title"
        if (fileName && fileName.includes(' - ')) {
          const parts = fileName.replace(/\.[^/.]+$/, '').split(' - ');
          if (parts.length >= 2) {
            parsedArtist = parts[0].trim();
            parsedTitle = parts.slice(1).join(' - ').trim();
          }
        }
        
        // Wait for metadata to load
        audio.addEventListener('loadedmetadata', () => {
          const extractedMetadata: AudioMetadata = {
            title: parsedTitle,
            artist: parsedArtist,
            album: undefined, // Not available from HTMLAudioElement
            duration: audio.duration || undefined
          };
          
          setMetadata(extractedMetadata);
          setIsLoading(false);
        });

        // Handle load errors
        audio.addEventListener('error', () => {
          console.warn('Could not extract metadata from audio file');
          // Still provide parsed filename info
          setMetadata({
            title: parsedTitle,
            artist: parsedArtist
          });
          setIsLoading(false);
        });

        // Start loading
        audio.load();
      } catch (error) {
        console.error('Error extracting audio metadata:', error);
        setIsLoading(false);
      }
    };

    extractMetadata();
  }, [audioUrl, fileName]);

  return { metadata, isLoading };
};
