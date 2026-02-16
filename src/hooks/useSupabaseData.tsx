import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useAdvancedAudioMetadata } from './useAdvancedAudioMetadata';

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  image_url?: string;
}

export interface AudioTrack {
  id: string;
  artist_id: string;
  title: string;
  audio_url: string;
  cover_image_url?: string;
  duration?: number;
  has_shopping_cart?: boolean;
  artist?: Artist;
}

export interface VideoTrack {
  id: string;
  artist_id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  artist?: Artist;
}

export interface NFCCard {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  shop_url?: string;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  platform: string;
}

export const useSupabaseData = () => {
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([]);
  const [nfcCards, setNfcCards] = useState<NFCCard[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Enable real-time subscriptions
  useRealtimeSubscription();

  const fetchData = async () => {
    try {
      // Fetch from music-files bucket (look in all folders)
      const { data: musicFolders } = await supabase.storage
        .from('music-files')
        .list('', { limit: 100 });

      // Fetch from video-files bucket (look in all folders)  
      const { data: videoFolders } = await supabase.storage
        .from('video-files')
        .list('', { limit: 100 });

      // Fetch artwork files from storage bucket
      const { data: artworkFiles } = await supabase.storage
        .from('artwork')
        .list('', { limit: 100 });

      const processedAudioTracks: AudioTrack[] = [];
      const processedVideoTracks: VideoTrack[] = [];

      // Process audio files from folders
      if (musicFolders) {
        for (const folder of musicFolders) {
          if (folder.name && !folder.name.includes('.emptyFolderPlaceholder')) {
            // List files in each folder
            const { data: folderFiles } = await supabase.storage
              .from('music-files')
              .list(folder.name, { limit: 100 });
            
            if (folderFiles) {
              folderFiles
                .filter(file => file.name && !file.name.includes('.emptyFolderPlaceholder') && 
                       (file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a')))
                .forEach((file, index) => {
                  // Extract artist name from folder name or try to parse from filename
                  let artistName = folder.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Artist';
                  
                  // Try to extract better artist name from filename format "Artist - Title"
                  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                  if (fileNameWithoutExt.includes(' - ')) {
                    const parts = fileNameWithoutExt.split(' - ');
                    if (parts.length >= 2) {
                      artistName = parts[0].trim();
                    }
                  }
                  
                  processedAudioTracks.push({
                    id: `audio-${folder.name}-${index}`,
                    artist_id: folder.name,
                    title: fileNameWithoutExt,
                    audio_url: supabase.storage.from('music-files').getPublicUrl(`${folder.name}/${file.name}`).data.publicUrl,
                    cover_image_url: artworkFiles?.[0] ? 
                      supabase.storage.from('artwork').getPublicUrl(artworkFiles[0].name).data.publicUrl : 
                      '/placeholder-cover.jpg',
                    duration: null,
                    has_shopping_cart: false,
                    artist: { id: folder.name, name: artistName, bio: null, image_url: null }
                  });
                });
            }
          }
        }
      }

      // Process video files from folders
      if (videoFolders) {
        for (const folder of videoFolders) {
          if (folder.name && !folder.name.includes('.emptyFolderPlaceholder')) {
            // List files in each folder
            const { data: folderFiles } = await supabase.storage
              .from('video-files')
              .list(folder.name, { limit: 100 });
            
            if (folderFiles) {
              folderFiles
                .filter(file => file.name && !file.name.includes('.emptyFolderPlaceholder') && 
                       (file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.avi')))
                .forEach((file, index) => {
                  // Extract artist name from folder name or try to parse from filename
                  let artistName = folder.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Artist';
                  
                  // Try to extract better artist name from filename format "Artist - Title"
                  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                  if (fileNameWithoutExt.includes(' - ')) {
                    const parts = fileNameWithoutExt.split(' - ');
                    if (parts.length >= 2) {
                      artistName = parts[0].trim();
                    }
                  }
                  
                  processedVideoTracks.push({
                    id: `video-${folder.name}-${index}`,
                    artist_id: folder.name,
                    title: fileNameWithoutExt,
                    video_url: supabase.storage.from('video-files').getPublicUrl(`${folder.name}/${file.name}`).data.publicUrl,
                    thumbnail_url: artworkFiles?.[1] ? 
                      supabase.storage.from('artwork').getPublicUrl(artworkFiles[1].name).data.publicUrl : 
                      '/placeholder-thumbnail.jpg',
                    duration: null,
                    artist: { id: folder.name, name: artistName, bio: null, image_url: null }
                  });
                });
            }
          }
        }
      }

      // Fetch NFC cards and social links from database
      const { data: nfcData } = await supabase
        .from('nfc_cards')
        .select('*');

      const { data: socialData } = await supabase
        .from('social_links')
        .select('*');

      setAudioTracks(processedAudioTracks);
      setVideoTracks(processedVideoTracks);
      setNfcCards(nfcData || []);
      setSocialLinks(socialData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates
    const handleDataUpdate = () => fetchData();
    window.addEventListener('supabase-data-update', handleDataUpdate);

    return () => {
      window.removeEventListener('supabase-data-update', handleDataUpdate);
    };
  }, []);

  return {
    audioTracks,
    videoTracks,
    nfcCards,
    socialLinks,
    isLoading
  };
};