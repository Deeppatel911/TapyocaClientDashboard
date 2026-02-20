import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrackAnalyticsEvent {
  eventType: 'play' | 'pause' | 'resume' | 'skip' | 'complete' | 'seek';
  trackId: string;
  trackType: 'audio' | 'video';
  timestamp: number;
  currentTime?: number;
  duration?: number;
  sessionId?: string;
}

interface TrackAnalyticsData {
  playCount: number;
  skipCount: number;
  avgListenDuration: number;
  completionRate: number;
  totalListenTime: number;
  lastPlayedAt: string | null;
}

interface UseTrackAnalyticsReturn {
  trackEvent: (event: TrackAnalyticsEvent) => void;
  getTrackAnalytics: (trackId: string, trackType: 'audio' | 'video') => Promise<TrackAnalyticsData | null>;
  updateAnalytics: (trackId: string, trackType: 'audio' | 'video', updates: Partial<TrackAnalyticsData>) => Promise<void>;
  isTracking: boolean;
}

export const useTrackAnalytics = (): UseTrackAnalyticsReturn => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const eventQueueRef = useRef<TrackAnalyticsEvent[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEventTimeRef = useRef<number>(0);

  // Generate or retrieve session ID
  const getSessionId = useCallback(() => {
    if (!sessionRef.current) {
      sessionRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return sessionRef.current;
  }, []);

  // Batch update to reduce database calls
  const flushEventQueue = useCallback(async () => {
    if (eventQueueRef.current.length === 0 || !user) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      // Group events by track
      const eventsByTrack: Record<string, TrackAnalyticsEvent[]> = {};
      events.forEach(event => {
        const key = `${event.trackId}_${event.trackType}`;
        if (!eventsByTrack[key]) {
          eventsByTrack[key] = [];
        }
        eventsByTrack[key].push(event);
      });

      // Process each track's events
      const trackEntries: Array<[string, TrackAnalyticsEvent[]]> = Object.entries(eventsByTrack);
      
      for (const [trackKey, trackEvents] of trackEntries) {
        const [trackId, trackType] = trackKey.split('_');
        
        // Get current analytics - now that track_id is TEXT type
        const { data: currentAnalytics, error: fetchError } = await supabase
          .from('track_analytics')
          .select('*')
          .eq('track_id', trackId)
          .eq('track_type', trackType)
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching analytics:', fetchError);
          continue; // Skip to next track
        }

        let analyticsData: any = currentAnalytics || {
          track_id: trackId,
          track_type: trackType,
          user_id: user.id,
          title: trackId, // Will be updated with actual title
          play_count: 0,
          skip_count: 0,
          avg_listen_duration: 0,
          completion_rate: 0,
          total_listen_time: 0,
          last_played_at: null,
        };

        // Process events
        let newPlayCount = analyticsData.play_count;
        let newSkipCount = analyticsData.skip_count;
        let totalListenTime = analyticsData.total_listen_time;
        let completions = 0;

        for (const event of trackEvents) {
          switch (event.eventType) {
            case 'play':
              newPlayCount++;
              analyticsData.last_played_at = new Date().toISOString();
              break;
            case 'skip':
              newSkipCount++;
              break;
            case 'complete':
              completions++;
              break;
            case 'pause':
            case 'resume':
            case 'seek':
              // These events will be handled for duration calculation
              break;
          }

          // Calculate listen duration for pause events
          if (event.currentTime && event.duration) {
            totalListenTime += Math.floor(event.currentTime);
          }
        }

        // Calculate metrics
        const avgListenDuration = newPlayCount > 0 ? Math.floor(totalListenTime / newPlayCount) : 0;
        const completionRate = newPlayCount > 0 ? Math.floor((completions / newPlayCount) * 100) : 0;

        // Update or insert analytics
        const updateData = {
          play_count: newPlayCount,
          skip_count: newSkipCount,
          avg_listen_duration: avgListenDuration,
          completion_rate: completionRate,
          total_listen_time: totalListenTime,
          last_played_at: analyticsData.last_played_at,
          updated_at: new Date().toISOString(),
        };

        if (currentAnalytics) {
          const { error: updateError } = await supabase
            .from('track_analytics')
            .update(updateData)
            .eq('id', (currentAnalytics as any).id);
          
          if (updateError) {
            console.error('Error updating analytics:', updateError);
            continue; // Skip to next track
          }
        } else {
          const { error: insertError } = await supabase
            .from('track_analytics')
            .insert({
              ...analyticsData,
              ...updateData,
              created_at: new Date().toISOString(),
            });
          
          if (insertError) {
            console.error('Error inserting analytics:', insertError);
            continue; // Skip to next track
          }
        }
      }

      console.log(`Batched ${events.length} analytics events`);
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Re-queue events on error
      eventQueueRef.current = [...events, ...eventQueueRef.current];
    }
  }, [user]);

  // Track an analytics event
  const trackEvent = useCallback((event: TrackAnalyticsEvent) => {
    if (!user) {
      console.warn('Cannot track analytics: user not authenticated');
      return;
    }

    // Debounce events to prevent spam (minimum 500ms between events of same type)
    const now = Date.now();
    const timeSinceLastEvent = now - lastEventTimeRef.current;
    
    if (timeSinceLastEvent < 500 && event.eventType !== 'play' && event.eventType !== 'complete') {
      console.log('Analytics event debounced:', event.eventType);
      return;
    }
    
    lastEventTimeRef.current = now;
    setIsTracking(true);
    
    // Add to queue
    eventQueueRef.current.push({
      ...event,
      sessionId: getSessionId(),
      timestamp: now,
    });

    // Batch events every 5 seconds or on next tick for immediate events
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    const delay = event.eventType === 'play' || event.eventType === 'complete' ? 100 : 5000;
    batchTimeoutRef.current = setTimeout(flushEventQueue, delay);
  }, [user, getSessionId, flushEventQueue]);

  // Get track analytics data
  const getTrackAnalytics = useCallback(async (
    trackId: string, 
    trackType: 'audio' | 'video'
  ): Promise<TrackAnalyticsData | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('track_analytics')
        .select('play_count, skip_count, avg_listen_duration, completion_rate, total_listen_time, last_played_at')
        .eq('track_id', trackId)
        .eq('track_type', trackType)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // Handle case where record doesn't exist
        if (error.code === 'PGRST116') {
          return {
            playCount: 0,
            skipCount: 0,
            avgListenDuration: 0,
            completionRate: 0,
            totalListenTime: 0,
            lastPlayedAt: null,
          };
        }
        throw error;
      }

      if (!data) {
        return {
          playCount: 0,
          skipCount: 0,
          avgListenDuration: 0,
          completionRate: 0,
          totalListenTime: 0,
          lastPlayedAt: null,
        };
      }

      return {
        playCount: (data as any).play_count || 0,
        skipCount: (data as any).skip_count || 0,
        avgListenDuration: (data as any).avg_listen_duration || 0,
        completionRate: (data as any).completion_rate || 0,
        totalListenTime: (data as any).total_listen_time || 0,
        lastPlayedAt: (data as any).last_played_at,
      };
    } catch (error) {
      console.error('Error getting track analytics:', error);
      return null;
    }
  }, [user]);

  // Update analytics data directly
  const updateAnalytics = useCallback(async (
    trackId: string,
    trackType: 'audio' | 'video',
    updates: Partial<TrackAnalyticsData>
  ) => {
    if (!user) return;

    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.playCount !== undefined) updateData.play_count = updates.playCount;
      if (updates.skipCount !== undefined) updateData.skip_count = updates.skipCount;
      if (updates.avgListenDuration !== undefined) updateData.avg_listen_duration = updates.avgListenDuration;
      if (updates.completionRate !== undefined) updateData.completion_rate = updates.completionRate;
      if (updates.totalListenTime !== undefined) updateData.total_listen_time = updates.totalListenTime;
      if (updates.lastPlayedAt !== undefined) updateData.last_played_at = updates.lastPlayedAt;

      const { error } = await supabase
        .from('track_analytics')
        .upsert({
          track_id: trackId,
          track_type: trackType,
          user_id: user.id,
          title: trackId, // Will be updated with actual title
          play_count: 0,
          skip_count: 0,
          avg_listen_duration: 0,
          completion_rate: 0,
          total_listen_time: 0,
          ...updateData,
        }, {
          onConflict: 'track_id,track_type,user_id'
        });

      if (error) {
        console.error('Error updating analytics:', error);
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }, [user]);

  // Flush events on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      flushEventQueue();
    };
  }, [flushEventQueue]);

  // Flush events when user changes
  useEffect(() => {
    if (!user) {
      flushEventQueue();
    }
  }, [user, flushEventQueue]);

  return {
    trackEvent,
    getTrackAnalytics,
    updateAnalytics,
    isTracking,
  };
};
