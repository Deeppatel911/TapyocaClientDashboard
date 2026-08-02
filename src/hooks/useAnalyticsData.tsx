import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTrackDirectory, TrackDirectoryEntry } from './useTrackDirectory';
import { prettifyTrackId } from '@/lib/trackNaming';

export interface AnalyticsData {
  totalPlays: number;
  totalListeningTime: number;
  favoriteTrack: {
    id: string;
    title: string;
    artist: string;
    playCount: number;
    trackType: 'audio' | 'video';
  } | null;
  playCountsByTrack: Array<{
    trackId: string;
    title: string;
    artist: string;
    playCount: number;
    trackType: 'audio' | 'video';
  }>;
  listeningTimeline: Array<{
    date: string;
    plays: number;
    listeningTime: number;
  }>;
  completionRates: {
    completed: number;
    skipped: number;
    completionRate: number;
  };
  mostPlayedTracks: Array<{
    id: string;
    title: string;
    artist: string;
    playCount: number;
    avgListenDuration: number;
    trackType: 'audio' | 'video';
  }>;
  mostSkippedTracks: Array<{
    id: string;
    title: string;
    artist: string;
    skipCount: number;
    trackType: 'audio' | 'video';
  }>;
  favoriteArtists: Array<{
    artistId: string;
    artistName: string;
    totalPlays: number;
    totalListeningTime: number;
  }>;
  detailedAnalytics: Array<{
    trackId: string;
    title: string;
    artist: string;
    trackType: 'audio' | 'video';
    playCount: number;
    skipCount: number;
    avgListenDuration: number;
    completionRate: number;
    totalListenTime: number;
    lastPlayedAt: string | null;
  }>;
}

export const useAnalyticsData = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  // Clean display names (artist/title) are resolved from storage, keyed by the
  // stable track_id slug. The audio_tracks/video_tracks DB tables can't be used
  // for this: they're keyed by uuid (not the text slug) and are currently empty.
  const { directory, isLoading: isDirectoryLoading } = useTrackDirectory();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Wait for the storage directory so we can resolve names in one pass.
    if (isDirectoryLoading) {
      return;
    }

    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Source of truth: the raw playback event stream. All dashboard metrics
        // are derived from these append-only rows (see useTrackAnalytics).
        const { data: events, error: fetchError } = await supabase
          .from('analytics_events')
          .select('event_type, metadata, created_at')
          .eq('user_id', user.id)
          .like('event_type', 'track_%')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        console.log('Analytics events fetched:', events?.length || 0, 'rows');
        console.log('Track directory entries:', directory.size);

        const processedData = processEvents(events || [], directory);
        setData(processedData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user, directory, isDirectoryLoading]);

  return { data, isLoading, error };
};

// Per-track aggregate accumulated from the raw event stream.
interface TrackAgg {
  trackId: string;
  trackType: 'audio' | 'video';
  playCount: number;
  skipCount: number;
  completeCount: number;
  totalListenTime: number;
  lastPlayedAt: string | null;
}

const processEvents = (
  events: any[],
  directory: Map<string, TrackDirectoryEntry>
): AnalyticsData => {
  // Resolve a clean { title, artist } for a track_id: prefer the storage
  // directory; fall back to a prettified slug if the track no longer exists.
  const resolveName = (trackId: string): { title: string; artist: string } => {
    const entry = directory.get(trackId);
    if (entry) {
      return { title: entry.title, artist: entry.artist };
    }
    return prettifyTrackId(trackId);
  };

  const trackMap = new Map<string, TrackAgg>();
  const timelineMap = new Map<string, { plays: number; listeningTime: number }>();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const ev of events) {
    const meta = ev.metadata || {};
    const trackId: string | undefined = meta.track_id;
    if (!trackId) continue;

    const trackType: 'audio' | 'video' = meta.track_type === 'video' ? 'video' : 'audio';
    const listened = Number(meta.listened_delta) || 0;

    let agg = trackMap.get(trackId);
    if (!agg) {
      agg = {
        trackId,
        trackType,
        playCount: 0,
        skipCount: 0,
        completeCount: 0,
        totalListenTime: 0,
        lastPlayedAt: null,
      };
      trackMap.set(trackId, agg);
    }

    agg.totalListenTime += listened;

    if (ev.event_type === 'track_play') {
      agg.playCount++;
      // events are ordered created_at desc, so the first play seen is the latest
      if (!agg.lastPlayedAt) agg.lastPlayedAt = ev.created_at;
    } else if (ev.event_type === 'track_skip') {
      agg.skipCount++;
    } else if (ev.event_type === 'track_complete') {
      agg.completeCount++;
    }

    // Timeline: bucket plays + listen time by actual event date (last 30 days).
    const created = new Date(ev.created_at);
    if (created >= thirtyDaysAgo) {
      const date = created.toISOString().split('T')[0];
      let bucket = timelineMap.get(date);
      if (!bucket) {
        bucket = { plays: 0, listeningTime: 0 };
        timelineMap.set(date, bucket);
      }
      if (ev.event_type === 'track_play') bucket.plays++;
      bucket.listeningTime += listened;
    }
  }

  const tracks = Array.from(trackMap.values());

  // Totals
  const totalPlays = tracks.reduce((sum, t) => sum + t.playCount, 0);
  const totalListeningTime = tracks.reduce((sum, t) => sum + t.totalListenTime, 0);
  const totalCompleted = tracks.reduce((sum, t) => sum + t.completeCount, 0);

  // Play counts by track
  const playCountsByTrack = tracks
    .map((t) => ({
      trackId: t.trackId,
      ...resolveName(t.trackId),
      playCount: t.playCount,
      trackType: t.trackType,
    }))
    .sort((a, b) => b.playCount - a.playCount);

  // Favorite track (most played)
  const favAgg = tracks.reduce<TrackAgg | null>(
    (fav, t) => (!fav || t.playCount > fav.playCount ? t : fav),
    null
  );
  const favoriteTrack =
    favAgg && favAgg.playCount > 0
      ? {
          id: favAgg.trackId,
          ...resolveName(favAgg.trackId),
          playCount: favAgg.playCount,
          trackType: favAgg.trackType,
        }
      : null;

  // Listening timeline (last 30 days), chronological
  const listeningTimeline = Array.from(timelineMap.entries())
    .map(([date, v]) => ({ date, plays: v.plays, listeningTime: v.listeningTime }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Completion rates (a "skip" here means a play that wasn't completed)
  const completionRates = {
    completed: totalCompleted,
    skipped: Math.max(0, totalPlays - totalCompleted),
    completionRate: totalPlays > 0 ? Math.round((totalCompleted / totalPlays) * 100) : 0,
  };

  // Most played tracks
  const mostPlayedTracks = tracks
    .slice()
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 10)
    .map((t) => ({
      id: t.trackId,
      ...resolveName(t.trackId),
      playCount: t.playCount,
      avgListenDuration: t.playCount > 0 ? Math.floor(t.totalListenTime / t.playCount) : 0,
      trackType: t.trackType,
    }));

  // Most skipped tracks
  const mostSkippedTracks = tracks
    .filter((t) => t.skipCount > 0)
    .sort((a, b) => b.skipCount - a.skipCount)
    .slice(0, 10)
    .map((t) => ({
      id: t.trackId,
      ...resolveName(t.trackId),
      skipCount: t.skipCount,
      trackType: t.trackType,
    }));

  // Favorite artists (grouped by resolved artist name)
  type ArtistStat = {
    artistId: string;
    artistName: string;
    totalPlays: number;
    totalListeningTime: number;
  };
  const artistStats = tracks.reduce<Record<string, ArtistStat>>((acc, t) => {
    const artistName = resolveName(t.trackId).artist;
    const artistId = artistName;

    if (!acc[artistId]) {
      acc[artistId] = { artistId, artistName, totalPlays: 0, totalListeningTime: 0 };
    }
    acc[artistId].totalPlays += t.playCount;
    acc[artistId].totalListeningTime += t.totalListenTime;
    return acc;
  }, {});

  const favoriteArtists = Object.values(artistStats)
    .sort((a, b) => b.totalPlays - a.totalPlays)
    .slice(0, 10);

  // Detailed analytics table
  const detailedAnalytics = tracks
    .map((t) => ({
      trackId: t.trackId,
      ...resolveName(t.trackId),
      trackType: t.trackType,
      playCount: t.playCount,
      skipCount: t.skipCount,
      avgListenDuration: t.playCount > 0 ? Math.floor(t.totalListenTime / t.playCount) : 0,
      completionRate: t.playCount > 0 ? Math.round((t.completeCount / t.playCount) * 100) : 0,
      totalListenTime: t.totalListenTime,
      lastPlayedAt: t.lastPlayedAt,
    }))
    .sort((a, b) => b.playCount - a.playCount);

  return {
    totalPlays,
    totalListeningTime,
    favoriteTrack,
    playCountsByTrack,
    listeningTimeline,
    completionRates,
    mostPlayedTracks,
    mostSkippedTracks,
    favoriteArtists,
    detailedAnalytics,
  };
};
