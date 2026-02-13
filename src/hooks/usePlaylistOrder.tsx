import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PlaylistOrder {
  audio_order: string[];
  video_order: string[];
}

// Fallback localStorage keys
const AUDIO_ORDER_KEY = 'tapyoca_audio_playlist_order';
const VIDEO_ORDER_KEY = 'tapyoca_video_playlist_order';

export const usePlaylistOrder = () => {
  const { user } = useAuth();
  const [audioOrder, setAudioOrder] = useState<string[]>([]);
  const [videoOrder, setVideoOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Load playlist order from Supabase or localStorage
  useEffect(() => {
    if (!user) {
      setAudioOrder([]);
      setVideoOrder([]);
      setIsLoading(false);
      return;
    }

    const loadPlaylistOrder = async () => {
      console.log('Loading playlist order for user:', user?.id);
      
      // Try Supabase first
      if (!useLocalStorage) {
        try {
          const { data, error } = await supabase
            .from('user_playlist_orders')
            .select('audio_order, video_order')
            .eq('user_id', user.id)
            .single();

          console.log('Load playlist order response:', { data, error });

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error loading playlist order:', error);
            // Fall back to localStorage if Supabase fails
            console.log('Falling back to localStorage');
            setUseLocalStorage(true);
          } else if (data) {
            console.log('Setting playlist orders from Supabase:', data);
            setAudioOrder(data.audio_order || []);
            setVideoOrder(data.video_order || []);
          } else {
            console.log('No existing playlist order found, trying localStorage');
            // Try localStorage as fallback
            const savedAudioOrder = localStorage.getItem(AUDIO_ORDER_KEY);
            const savedVideoOrder = localStorage.getItem(VIDEO_ORDER_KEY);
            
            if (savedAudioOrder || savedVideoOrder) {
              setAudioOrder(savedAudioOrder ? JSON.parse(savedAudioOrder) : []);
              setVideoOrder(savedVideoOrder ? JSON.parse(savedVideoOrder) : []);
              console.log('Loaded from localStorage:', { savedAudioOrder, savedVideoOrder });
            } else {
              setAudioOrder([]);
              setVideoOrder([]);
            }
          }
        } catch (error) {
          console.error('Failed to load playlist order from Supabase:', error);
          console.log('Falling back to localStorage due to error');
          setUseLocalStorage(true);
        }
      }
      
      // Load from localStorage if fallback mode
      if (useLocalStorage) {
        try {
          const savedAudioOrder = localStorage.getItem(AUDIO_ORDER_KEY);
          const savedVideoOrder = localStorage.getItem(VIDEO_ORDER_KEY);
          
          setAudioOrder(savedAudioOrder ? JSON.parse(savedAudioOrder) : []);
          setVideoOrder(savedVideoOrder ? JSON.parse(savedVideoOrder) : []);
          console.log('Loaded from localStorage (fallback mode):', { savedAudioOrder, savedVideoOrder });
        } catch (error) {
          console.error('Failed to load from localStorage:', error);
          setAudioOrder([]);
          setVideoOrder([]);
        }
      }
      
      setIsLoading(false);
    };

    loadPlaylistOrder();
  }, [user, useLocalStorage]);

  // Save playlist order to Supabase or localStorage
  const savePlaylistOrder = async (type: 'audio' | 'video', order: string[]) => {
    console.log('savePlaylistOrder called:', { type, order, user: user?.id });
    
    if (!user) {
      console.log('No user found, cannot save playlist order');
      return false;
    }

    // Update local state immediately
    if (type === 'audio') {
      setAudioOrder(order);
    } else {
      setVideoOrder(order);
    }

    // Try Supabase first if not in fallback mode
    if (!useLocalStorage) {
      try {
        const updateData = type === 'audio' 
          ? { audio_order: order }
          : { video_order: order };

        console.log('Saving to Supabase:', updateData);

        const { data, error } = await supabase
          .from('user_playlist_orders')
          .upsert({
            user_id: user.id,
            ...updateData,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
          .select();

        console.log('Supabase response:', { data, error });

        if (error) {
          console.error('Error saving playlist order to Supabase:', error);
          console.log('Falling back to localStorage');
          setUseLocalStorage(true);
          // Continue to localStorage fallback
        } else {
          console.log('Playlist order saved successfully to Supabase');
          return true;
        }
      } catch (error) {
        console.error('Failed to save playlist order to Supabase:', error);
        console.log('Falling back to localStorage due to error');
        setUseLocalStorage(true);
        // Continue to localStorage fallback
      }
    }

    // localStorage fallback
    try {
      const key = type === 'audio' ? AUDIO_ORDER_KEY : VIDEO_ORDER_KEY;
      localStorage.setItem(key, JSON.stringify(order));
      console.log(`Saved to localStorage (${key}):`, order);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  };

  // Apply playlist order to tracks
  const applyOrderToTracks = <T extends { id: string }>(
    tracks: T[], 
    type: 'audio' | 'video'
  ): T[] => {
    const order = type === 'audio' ? audioOrder : videoOrder;
    
    if (order.length === 0) {
      return tracks; // Return original order if no custom order exists
    }

    // Create a map of tracks by ID for quick lookup
    const trackMap = new Map(tracks.map(track => [track.id, track]));
    
    // Reorder tracks based on saved order, placing any new tracks at the end
    const orderedTracks: T[] = [];
    const usedIds = new Set<string>();

    // Add tracks in the saved order
    order.forEach(id => {
      const track = trackMap.get(id);
      if (track) {
        orderedTracks.push(track);
        usedIds.add(id);
      }
    });

    // Add any tracks that weren't in the saved order (new tracks)
    tracks.forEach(track => {
      if (!usedIds.has(track.id)) {
        orderedTracks.push(track);
      }
    });

    return orderedTracks;
  };

  // Clear playlist order (reset to default)
  const clearPlaylistOrder = async (type: 'audio' | 'video') => {
    if (!user) return false;

    // Update local state immediately
    if (type === 'audio') {
      setAudioOrder([]);
    } else {
      setVideoOrder([]);
    }

    // Try Supabase first if not in fallback mode
    if (!useLocalStorage) {
      try {
        const { error } = await supabase
          .from('user_playlist_orders')
          .update({
            [type === 'audio' ? 'audio_order' : 'video_order']: [],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing playlist order in Supabase:', error);
          setUseLocalStorage(true);
          // Continue to localStorage fallback
        } else {
          console.log('Playlist order cleared successfully in Supabase');
          return true;
        }
      } catch (error) {
        console.error('Failed to clear playlist order in Supabase:', error);
        setUseLocalStorage(true);
        // Continue to localStorage fallback
      }
    }

    // localStorage fallback
    try {
      const key = type === 'audio' ? AUDIO_ORDER_KEY : VIDEO_ORDER_KEY;
      localStorage.setItem(key, JSON.stringify([]));
      console.log(`Cleared playlist order in localStorage (${key})`);
      return true;
    } catch (error) {
      console.error('Failed to clear playlist order in localStorage:', error);
      return false;
    }
  };

  return {
    audioOrder,
    videoOrder,
    isLoading,
    savePlaylistOrder,
    applyOrderToTracks,
    clearPlaylistOrder
  };
};
