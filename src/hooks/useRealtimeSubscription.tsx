import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useRealtimeSubscription = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time changes for audio tracks
    const audioChannel = supabase
      .channel('audio-tracks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_tracks'
        },
        (payload) => {
          console.log('Audio track updated:', payload);
          // Trigger refetch in components using useSupabaseData
          window.dispatchEvent(new CustomEvent('supabase-data-update', {
            detail: { table: 'audio_tracks', payload }
          }));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to real-time changes for video tracks
    const videoChannel = supabase
      .channel('video-tracks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_tracks'
        },
        (payload) => {
          console.log('Video track updated:', payload);
          window.dispatchEvent(new CustomEvent('supabase-data-update', {
            detail: { table: 'video_tracks', payload }
          }));
        }
      )
      .subscribe();

    // Subscribe to real-time changes for social links
    const socialChannel = supabase
      .channel('social-links-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_links'
        },
        (payload) => {
          console.log('Social link updated:', payload);
          window.dispatchEvent(new CustomEvent('supabase-data-update', {
            detail: { table: 'social_links', payload }
          }));
        }
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(audioChannel);
      supabase.removeChannel(videoChannel);
      supabase.removeChannel(socialChannel);
    };
  }, [user]);

  return { isConnected };
};