import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AudioTrack } from './useSupabaseData';

interface PlaybackEvent {
  trackId: string;
  eventType: 'play' | 'pause' | 'complete' | 'skip';
  timestamp: number;
  currentTime: number;
  duration: number;
}

export const useAudioAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  const trackEvent = async (event: PlaybackEvent) => {
    try {
      // Store analytics in Supabase
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: `track_${event.eventType}`,
          metadata: {
            track_id: event.trackId,
            current_time: event.currentTime,
            duration: event.duration,
            timestamp: event.timestamp,
            session_id: sessionStorage.getItem('session_id') || 'anonymous'
          }
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  };

  const trackPlay = (track: AudioTrack, currentTime: number = 0) => {
    trackEvent({
      trackId: track.id,
      eventType: 'play',
      timestamp: Date.now(),
      currentTime,
      duration: track.duration || 0
    });
  };

  const trackPause = (track: AudioTrack, currentTime: number) => {
    trackEvent({
      trackId: track.id,
      eventType: 'pause',
      timestamp: Date.now(),
      currentTime,
      duration: track.duration || 0
    });
  };

  const trackComplete = (track: AudioTrack) => {
    trackEvent({
      trackId: track.id,
      eventType: 'complete',
      timestamp: Date.now(),
      currentTime: track.duration || 0,
      duration: track.duration || 0
    });
  };

  const trackSkip = (track: AudioTrack, currentTime: number) => {
    trackEvent({
      trackId: track.id,
      eventType: 'skip',
      timestamp: Date.now(),
      currentTime,
      duration: track.duration || 0
    });
  };

  const getTrackAnalytics = async (trackId: string) => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('metadata->>track_id', trackId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch track analytics:', error);
      return [];
    }
  };

  return {
    trackPlay,
    trackPause,
    trackComplete,
    trackSkip,
    getTrackAnalytics,
    analyticsData
  };
};