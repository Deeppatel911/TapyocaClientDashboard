import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  deriveArtistAndTitle,
  buildTrackId,
  MediaType,
} from '@/lib/trackNaming';

export interface TrackDirectoryEntry {
  trackId: string;
  title: string;
  artist: string;
  trackType: MediaType;
}

/**
 * Read-only directory of all tracks in storage, keyed by their stable
 * `track_id` slug. Unlike `useSupabaseData`, this hook does NOT write to the
 * database or build playable URLs — it only lists the buckets to produce a
 * `trackId -> { title, artist }` lookup so the analytics dashboard can show
 * clean names instead of raw slugs. Uses the shared `lib/trackNaming` helpers
 * so its slugs match exactly what the players record.
 */
export const useTrackDirectory = () => {
  const [directory, setDirectory] = useState<Map<string, TrackDirectoryEntry>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const buildDirectory = async () => {
      const map = new Map<string, TrackDirectoryEntry>();

      const indexBucket = async (
        bucket: string,
        type: MediaType,
        extensions: string[]
      ) => {
        const { data: folders } = await supabase.storage
          .from(bucket)
          .list('', { limit: 100 });

        if (!folders) return;

        for (const folder of folders) {
          if (!folder.name || folder.name.includes('.emptyFolderPlaceholder')) {
            continue;
          }

          const { data: files } = await supabase.storage
            .from(bucket)
            .list(folder.name, { limit: 100 });

          if (!files) continue;

          files
            .filter(
              (file) =>
                file.name &&
                !file.name.includes('.emptyFolderPlaceholder') &&
                extensions.some((ext) => file.name.endsWith(ext))
            )
            .forEach((file) => {
              const { artist, title } = deriveArtistAndTitle(
                folder.name,
                file.name
              );
              const trackId = buildTrackId(type, folder.name, title);
              map.set(trackId, { trackId, title, artist, trackType: type });
            });
        }
      };

      try {
        await indexBucket('music-files', 'audio', ['.mp3', '.wav', '.m4a']);
        await indexBucket('video-files', 'video', ['.mp4', '.mov', '.avi']);
      } catch (error) {
        console.error('Failed to build track directory:', error);
      }

      if (!cancelled) {
        setDirectory(map);
        setIsLoading(false);
      }
    };

    buildDirectory();

    return () => {
      cancelled = true;
    };
  }, []);

  return { directory, isLoading };
};
