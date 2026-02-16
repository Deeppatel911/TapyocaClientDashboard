import { useState, useEffect } from 'react';

export interface AdvancedAudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  albumartist?: string;
  year?: number;
  genre?: string;
  track?: number;
  duration?: number;
  bitrate?: number;
  format?: string;
}

// Fallback metadata extraction when music-metadata is not available
const extractBasicMetadata = (fileName: string, folderName: string): AdvancedAudioMetadata => {
  let artist = folderName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Artist';
  let title = fileName.replace(/\.[^/.]+$/, '') || 'Unknown Track';
  
  // Try to extract from "Artist - Title" format
  const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  if (fileNameWithoutExt.includes(' - ')) {
    const parts = fileNameWithoutExt.split(' - ');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }
  }
  
  // Try to extract from "Track Number. Title" format
  const trackNumberMatch = title.match(/^(\d+)\.\s*(.+)$/);
  if (trackNumberMatch) {
    title = trackNumberMatch[2];
  }
  
  return {
    title,
    artist,
    album: folderName,
    albumartist: artist
  };
};

export const useAdvancedAudioMetadata = (audioUrl: string, fileName?: string, folderName?: string) => {
  const [metadata, setMetadata] = useState<AdvancedAudioMetadata>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;

    const extractMetadata = async () => {
      setIsLoading(true);
      
      try {
        // First, get basic metadata from filename
        const basicMetadata = extractBasicMetadata(fileName || '', folderName || '');
        
        // Try to extract more metadata from the audio file
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('loadedmetadata', () => {
          const enhancedMetadata: AdvancedAudioMetadata = {
            ...basicMetadata,
            duration: audio.duration || undefined,
            format: audioUrl.split('.').pop()?.toLowerCase()
          };
          
          setMetadata(enhancedMetadata);
          setIsLoading(false);
        });

        audio.addEventListener('error', () => {
          console.warn('Could not load audio metadata, using filename extraction');
          setMetadata(basicMetadata);
          setIsLoading(false);
        });

        audio.load();
        
        // Try to fetch additional metadata via HEAD request (for some servers)
        try {
          const response = await fetch(audioUrl, { method: 'HEAD' });
          const contentType = response.headers.get('content-type');
          if (contentType) {
            setMetadata(prev => ({ ...prev, format: contentType.split('/')[1] }));
          }
        } catch (error) {
          // Ignore HEAD request errors
        }
        
      } catch (error) {
        console.error('Error extracting audio metadata:', error);
        // Fallback to filename extraction
        const fallbackMetadata = extractBasicMetadata(fileName || '', folderName || '');
        setMetadata(fallbackMetadata);
        setIsLoading(false);
      }
    };

    extractMetadata();
  }, [audioUrl, fileName, folderName]);

  return { metadata, isLoading };
};
