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

// A single raw event ready to be inserted into `analytics_events`.
interface QueuedEvent {
  eventType: TrackAnalyticsEvent['eventType'];
  trackId: string;
  trackType: 'audio' | 'video';
  position: number;        // playback position (seconds) when the event fired
  duration: number;        // track duration (seconds), 0 if unknown
  listenedDelta: number;   // seconds actually listened since the last play/resume
  sessionId: string;
  occurredAt: string;      // ISO timestamp
}

/**
 * Event-sourced playback analytics.
 *
 * Every playback action is recorded as an append-only row in `analytics_events`
 * (no read-modify-write, so concurrent tabs/devices can't clobber counts). The
 * dashboard (useAnalyticsData) derives all metrics from this raw stream.
 *
 * Listen time is measured as a DELTA: we remember the playback position when a
 * track starts/resumes, and when that listening stretch ends (pause / skip /
 * complete / seek) we record `position - segmentStart`. Summing deltas gives the
 * true seconds heard — unlike the old code, which summed absolute positions and
 * massively over-counted.
 */
export const useTrackAnalytics = (): UseTrackAnalyticsReturn => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const eventQueueRef = useRef<QueuedEvent[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeekTimeRef = useRef<number>(0);
  // Open listening segment: which track is playing and from what position.
  const segmentRef = useRef<{ trackId: string; startPosition: number } | null>(null);

  // Generate or retrieve session ID
  const getSessionId = useCallback(() => {
    if (!sessionRef.current) {
      sessionRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return sessionRef.current;
  }, []);

  // Flush queued events to analytics_events as a single bulk insert.
  const flushEventQueue = useCallback(async () => {
    if (eventQueueRef.current.length === 0 || !user) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    const rows = events.map((e) => ({
      event_type: `track_${e.eventType}`,
      user_id: user.id,
      created_at: e.occurredAt,
      metadata: {
        track_id: e.trackId,
        track_type: e.trackType,
        position: e.position,
        duration: e.duration,
        listened_delta: e.listenedDelta,
        session_id: e.sessionId,
      },
    }));

    try {
      const { error } = await supabase.from('analytics_events').insert(rows);
      if (error) {
        console.error('Error inserting analytics events:', error);
        // Re-queue on failure so we don't lose events.
        eventQueueRef.current = [...events, ...eventQueueRef.current];
      } else {
        console.log(`Flushed ${rows.length} analytics events`);
      }
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      eventQueueRef.current = [...events, ...eventQueueRef.current];
    }
  }, [user]);

  // Track an analytics event.
  const trackEvent = useCallback((event: TrackAnalyticsEvent) => {
    if (!user) {
      console.warn('Cannot track analytics: user not authenticated');
      return;
    }

    const now = Date.now();
    const position = Math.max(0, Math.floor(event.currentTime ?? 0));
    const duration = Math.max(0, Math.floor(event.duration ?? 0));

    // Debounce only rapid-fire seeks; never drop play/skip/complete (they're counts).
    if (event.eventType === 'seek') {
      if (now - lastSeekTimeRef.current < 500) return;
      lastSeekTimeRef.current = now;
    }

    // --- Delta-based listen time ---
    // Credit listened seconds ONLY when a stretch ends (pause/skip/complete),
    // measured from the segment's start position to the end position. play/resume
    // open a segment; seek just re-anchors (we can't know the pre-seek position,
    // so we never credit the jump — under-counting on heavy seeking is acceptable,
    // wild over-counting is not).
    const segment = segmentRef.current;
    const sameTrackSegment = segment && segment.trackId === event.trackId;
    let listenedDelta = 0;

    switch (event.eventType) {
      case 'play':
      case 'resume':
        segmentRef.current = { trackId: event.trackId, startPosition: position };
        break;
      case 'seek':
        segmentRef.current = { trackId: event.trackId, startPosition: position };
        break;
      case 'pause':
      case 'skip':
      case 'complete':
        if (sameTrackSegment) {
          const raw = position - segment!.startPosition;
          const cap = duration > 0 ? duration : raw;
          listenedDelta = Math.max(0, Math.min(raw, cap));
        }
        segmentRef.current = null;
        break;
    }

    setIsTracking(true);

    eventQueueRef.current.push({
      eventType: event.eventType,
      trackId: event.trackId,
      trackType: event.trackType,
      position,
      duration,
      listenedDelta,
      sessionId: getSessionId(),
      occurredAt: new Date(now).toISOString(),
    });

    // Flush quickly for milestone events, otherwise batch.
    if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
    const immediate = event.eventType === 'play' || event.eventType === 'complete';
    batchTimeoutRef.current = setTimeout(flushEventQueue, immediate ? 100 : 3000);
  }, [user, getSessionId, flushEventQueue]);

  // Aggregate a single track's metrics from the raw event stream.
  const getTrackAnalytics = useCallback(async (
    trackId: string,
    trackType: 'audio' | 'video'
  ): Promise<TrackAnalyticsData | null> => {
    if (!user) return null;

    const empty: TrackAnalyticsData = {
      playCount: 0,
      skipCount: 0,
      avgListenDuration: 0,
      completionRate: 0,
      totalListenTime: 0,
      lastPlayedAt: null,
    };

    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type, metadata, created_at')
        .eq('user_id', user.id)
        .eq('metadata->>track_id', trackId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return empty;

      let playCount = 0;
      let skipCount = 0;
      let completeCount = 0;
      let totalListenTime = 0;
      let lastPlayedAt: string | null = null;

      for (const row of data as any[]) {
        const meta = row.metadata || {};
        totalListenTime += Number(meta.listened_delta) || 0;
        if (row.event_type === 'track_play') {
          playCount++;
          if (!lastPlayedAt) lastPlayedAt = row.created_at;
        } else if (row.event_type === 'track_skip') {
          skipCount++;
        } else if (row.event_type === 'track_complete') {
          completeCount++;
        }
      }

      return {
        playCount,
        skipCount,
        avgListenDuration: playCount > 0 ? Math.floor(totalListenTime / playCount) : 0,
        completionRate: playCount > 0 ? Math.round((completeCount / playCount) * 100) : 0,
        totalListenTime,
        lastPlayedAt,
      };
    } catch (error) {
      console.error('Error getting track analytics:', error);
      return empty;
    }
  }, [user]);

  // No longer used to mutate aggregates (the dashboard derives them from events).
  // Kept for API compatibility.
  const updateAnalytics = useCallback(async (
    _trackId: string,
    _trackType: 'audio' | 'video',
    _updates: Partial<TrackAnalyticsData>
  ) => {
    /* deprecated: analytics are now event-sourced; nothing to update directly */
  }, []);

  // Flush events on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      flushEventQueue();
    };
  }, [flushEventQueue]);

  // Flush events when user changes / logs out
  useEffect(() => {
    if (!user) flushEventQueue();
  }, [user, flushEventQueue]);

  return {
    trackEvent,
    getTrackAnalytics,
    updateAnalytics,
    isTracking,
  };
};
