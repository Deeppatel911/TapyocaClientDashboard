import { useState, useEffect } from 'react';
import { AudioTrack } from './useSupabaseData';

interface PlayerState {
  currentTrack: AudioTrack | null;
  currentIndex: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  playbackSpeed: number;
  repeatMode: 'none' | 'all' | 'one';
  isShuffling: boolean;
  lastPlayedTimestamp: number;
}

const STORAGE_KEY = 'tapyoca_player_state';

const defaultState: PlayerState = {
  currentTrack: null,
  currentIndex: 0,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  volume: 1,
  playbackSpeed: 1,
  repeatMode: 'none',
  isShuffling: false,
  lastPlayedTimestamp: 0
};

export const usePlayerState = () => {
  const [state, setState] = useState<PlayerState>(defaultState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to load player state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save player state:', error);
    }
  }, [state]);

  const updateState = (updates: Partial<PlayerState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      lastPlayedTimestamp: Date.now()
    }));
  };

  const setCurrentTrack = (track: AudioTrack | null, index: number = 0) => {
    updateState({
      currentTrack: track,
      currentIndex: index,
      currentTime: 0 // Reset position when changing tracks
    });
  };

  const setCurrentTime = (time: number) => {
    updateState({ currentTime: time });
  };

  const setDuration = (duration: number) => {
    updateState({ duration });
  };

  const setIsPlaying = (isPlaying: boolean) => {
    updateState({ isPlaying });
  };

  const setVolume = (volume: number) => {
    updateState({ volume });
  };

  const setPlaybackSpeed = (speed: number) => {
    updateState({ playbackSpeed: speed });
  };

  const setRepeatMode = (mode: 'none' | 'all' | 'one') => {
    updateState({ repeatMode: mode });
  };

  const setIsShuffling = (shuffling: boolean) => {
    updateState({ isShuffling: shuffling });
  };

  // Resume functionality - check if we should resume from last position
  const shouldResume = (track: AudioTrack): boolean => {
    const timeSinceLastPlay = Date.now() - state.lastPlayedTimestamp;
    const resumeTimeLimit = 30 * 60 * 1000; // 30 minutes
    
    return (
      state.currentTrack?.id === track.id &&
      state.currentTime > 30 && // Only resume if more than 30 seconds in
      timeSinceLastPlay < resumeTimeLimit
    );
  };

  const getResumeTime = (track: AudioTrack): number => {
    return shouldResume(track) ? state.currentTime : 0;
  };

  const clearState = () => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    ...state,
    updateState,
    setCurrentTrack,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setVolume,
    setPlaybackSpeed,
    setRepeatMode,
    setIsShuffling,
    shouldResume,
    getResumeTime,
    clearState
  };
};