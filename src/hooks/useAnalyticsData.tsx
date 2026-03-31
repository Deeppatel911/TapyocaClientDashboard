import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AudioTrack, VideoTrack } from './useSupabaseData';

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

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all analytics data for the user
        // @ts-ignore - Type instantiation depth issue
        const { data: analyticsData, error: fetchError } = await supabase
          .from('track_analytics')
          .select('*')
          .eq('user_id', user.id)
          .order('last_played_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Fetch track information with full details
        console.log('Fetching audio tracks...');
        // @ts-ignore - Type instantiation depth issue
        const { data: audioTracks, error: audioError } = await supabase
          .from('audio_tracks')
          .select('id, title, artist_id, duration');
        
        console.log('Fetching video tracks...');
        // @ts-ignore - Type instantiation depth issue
        const { data: videoTracks, error: videoError } = await supabase
          .from('video_tracks')
          .select('id, title, artist_id, duration');

        console.log('Audio tracks error:', audioError);
        console.log('Video tracks error:', videoError);

        // Fetch artist information
        // @ts-ignore - Type instantiation depth issue
        const { data: artists } = await supabase
          .from('artists')
          .select('id, name');

        // Combine all data
        const allTracks = [
          ...(audioTracks || []).map(track => ({ ...track, trackType: 'audio' as const })),
          ...(videoTracks || []).map(track => ({ ...track, trackType: 'video' as const }))
        ];

        const artistMap = (artists || []).reduce((acc, artist) => {
          acc[artist.id] = artist.name;
          return acc;
        }, {} as Record<string, string>);

        // Debug logging
        console.log('Analytics data fetched:', analyticsData?.length || 0, 'records');
        console.log('Audio tracks:', audioTracks?.length || 0, 'records');
        console.log('Video tracks:', videoTracks?.length || 0, 'records');
        console.log('Artists:', artists?.length || 0, 'records');

        // Process analytics data
        const processedData = processAnalyticsData(analyticsData || [], allTracks, artistMap);
        setData(processedData);

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user, supabase]);

  return { data, isLoading, error };
};

const processAnalyticsData = (
  analyticsData: any[],
  allTracks: Array<{ id: string; title: string; artist_id: string; trackType: 'audio' | 'video' }>,
  artistMap: Record<string, string>
): AnalyticsData => {
  console.log('Processing analytics data:', analyticsData.length, 'records');
  console.log('Available tracks:', allTracks.length, 'records');
  
  // Create track map for easier lookup
  const trackMap = allTracks.reduce((acc, track) => {
    acc[track.id] = track;
    return acc;
  }, {} as Record<string, any>);
  
  // Log sample data for debugging
  if (analyticsData.length > 0) {
    console.log('Sample analytics record:', analyticsData[0]);
    console.log('Sample track lookup:', trackMap[analyticsData[0].track_id]);
  }
  // Calculate total metrics
  const totalPlays = analyticsData.reduce((sum, item) => sum + (item.play_count || 0), 0);
  const totalListeningTime = analyticsData.reduce((sum, item) => sum + (item.total_listen_time || 0), 0);

  // Find favorite track (most played)
  const favoriteTrackData = analyticsData.reduce((favorite, item) => {
    if (!favorite || (item.play_count || 0) > (favorite.play_count || 0)) {
      return item;
    }
    return favorite;
  }, null as any);

  const favoriteTrack = favoriteTrackData ? {
    id: favoriteTrackData.track_id,
    title: trackMap[favoriteTrackData.track_id]?.title || favoriteTrackData.title || 'Unknown Track',
    artist: artistMap[trackMap[favoriteTrackData.track_id]?.artist_id] || 'Unknown Artist',
    playCount: favoriteTrackData.play_count || 0,
    trackType: favoriteTrackData.track_type
  } : null;

  // Play counts by track
  const playCountsByTrack = analyticsData.map(item => ({
    trackId: item.track_id,
    title: trackMap[item.track_id]?.title || item.title || 'Unknown Track',
    artist: artistMap[trackMap[item.track_id]?.artist_id] || 'Unknown Artist',
    playCount: item.play_count || 0,
    trackType: item.track_type || 'audio'
  })).sort((a, b) => b.playCount - a.playCount);

  // Listening timeline (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const timelineData = analyticsData
    .filter(item => item.last_played_at && new Date(item.last_played_at) >= thirtyDaysAgo)
    .reduce((acc, item) => {
      const date = new Date(item.last_played_at!).toISOString().split('T')[0];
      const existing = acc.find(d => d.date === date);
      
      if (existing) {
        existing.plays += item.play_count || 0;
        existing.listeningTime += item.total_listen_time || 0;
      } else {
        acc.push({
          date,
          plays: item.play_count || 0,
          listeningTime: item.total_listen_time || 0
        });
      }
      return acc;
    }, [] as Array<{ date: string; plays: number; listeningTime: number }>)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Completion rates
  const totalCompleted = analyticsData.reduce((sum, item) => {
    const completionRate = item.completion_rate || 0;
    const playCount = item.play_count || 0;
    return sum + Math.floor((completionRate / 100) * playCount);
  }, 0);

  const completionRates = {
    completed: totalCompleted,
    skipped: totalPlays - totalCompleted,
    completionRate: totalPlays > 0 ? Math.round((totalCompleted / totalPlays) * 100) : 0
  };

  // Most played tracks
  const mostPlayedTracks = playCountsByTrack.slice(0, 10).map(item => {
    const analyticsItem = analyticsData.find(a => a.track_id === item.trackId);
    return {
      id: item.trackId,
      title: item.title,
      artist: item.artist,
      playCount: item.playCount,
      avgListenDuration: analyticsItem?.avg_listen_duration || 0,
      trackType: item.trackType
    };
  });

  // Most skipped tracks
  const mostSkippedTracks = analyticsData
    .filter(item => (item.skip_count || 0) > 0)
    .map(item => ({
      id: item.track_id,
      title: trackMap[item.track_id]?.title || 'Unknown Track',
      artist: artistMap[trackMap[item.track_id]?.artist_id] || 'Unknown Artist',
      skipCount: item.skip_count || 0,
      trackType: item.track_type || 'audio'
    }))
    .sort((a, b) => b.skipCount - a.skipCount)
    .slice(0, 10);

  // Favorite artists
  const artistStats = analyticsData.reduce((acc, item) => {
    const track = trackMap[item.track_id];
    const artistId = track?.artist_id || 'unknown';
    const artistName = artistMap[artistId] || 'Unknown Artist';
    
    if (!acc[artistId]) {
      acc[artistId] = {
        artistId,
        artistName,
        totalPlays: 0,
        totalListeningTime: 0
      };
    }
    
    acc[artistId].totalPlays += item.play_count || 0;
    acc[artistId].totalListeningTime += item.total_listen_time || 0;
    
    return acc;
  }, {} as Record<string, {
    artistId: string;
    artistName: string;
    totalPlays: number;
    totalListeningTime: number;
  }>);

  const favoriteArtists = Object.values(artistStats)
    .sort((a, b) => b.totalPlays - a.totalPlays)
    .slice(0, 10);

  // Detailed analytics table
  const detailedAnalytics = analyticsData.map(item => ({
    trackId: item.track_id,
    title: trackMap[item.track_id]?.title || 'Unknown Track',
    artist: artistMap[trackMap[item.track_id]?.artist_id] || 'Unknown Artist',
    trackType: item.track_type,
    playCount: item.play_count || 0,
    skipCount: item.skip_count || 0,
    avgListenDuration: item.avg_listen_duration || 0,
    completionRate: item.completion_rate || 0,
    totalListenTime: item.total_listen_time || 0,
    lastPlayedAt: item.last_played_at
  })).sort((a, b) => b.playCount - a.playCount);

  return {
    totalPlays,
    totalListeningTime,
    favoriteTrack,
    playCountsByTrack,
    listeningTimeline: timelineData,
    completionRates,
    mostPlayedTracks,
    mostSkippedTracks,
    favoriteArtists,
    detailedAnalytics
  };
};
