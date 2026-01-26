import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useSupabaseData, AudioTrack } from '@/hooks/useSupabaseData';
import { usePlayerState } from '@/hooks/usePlayerState';
import { useAudioAnalytics } from '@/hooks/useAudioAnalytics';
import { useHLSPlayer } from '@/hooks/useHLSPlayer';
import { DraggablePlaylist } from './DraggablePlaylist';
import { TrackControls } from './TrackControls';
import { LyricsDisplay } from './LyricsDisplay';
import { 
  HiOutlineQueueList, 
  HiOutlineShoppingCart, 
  HiOutlinePlay, 
  HiOutlinePause, 
  HiOutlineBackward, 
  HiOutlineForward
} from 'react-icons/hi2';
import { HiOutlineVolumeUp, HiOutlineVolumeOff } from 'react-icons/hi';
import { BiShuffle, BiRepeat } from 'react-icons/bi';
import { BsSpeedometer2 } from 'react-icons/bs';
import { formatTitle } from '@/lib/utils';

interface EnhancedAudioPlayerProps {
  onTrackPlay?: (track: AudioTrack, index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const EnhancedAudioPlayer = ({ 
  onTrackPlay, 
  onPlayStateChange, 
  onTimeUpdate 
}: EnhancedAudioPlayerProps = {}) => {
  const { audioTracks, isLoading } = useSupabaseData();
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [trackDelay, setTrackDelay] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const delayRef = useRef<NodeJS.Timeout | null>(null);

  const playerState = usePlayerState();
  const analytics = useAudioAnalytics();

  // Initialize playlist when audio tracks load
  useEffect(() => {
    if (audioTracks.length > 0 && playlist.length === 0) {
      setPlaylist(audioTracks);
      if (!playerState.currentTrack) {
        playerState.setCurrentTrack(audioTracks[0], 0);
      }
    }
  }, [audioTracks, playlist.length]);

  // Set up HLS player
  const {
    audioRef,
    isLoading: hlsLoading,
    error: hlsError,
    play,
    pause,
    seek,
    getCurrentTime,
    getDuration,
    isPaused
  } = useHLSPlayer({
    src: playerState.currentTrack?.audio_url || '',
    onLoadedMetadata: (duration) => {
      playerState.setDuration(duration);
      onTimeUpdate?.(0, duration);
      
      // Resume from saved position if applicable
      if (playerState.currentTrack) {
        const resumeTime = playerState.getResumeTime(playerState.currentTrack);
        if (resumeTime > 0) {
          seek(resumeTime);
          playerState.setCurrentTime(resumeTime);
        }
      }
    },
    onTimeUpdate: (currentTime) => {
      playerState.setCurrentTime(currentTime);
      onTimeUpdate?.(currentTime, playerState.duration);
    },
    onPlay: () => {
      playerState.setIsPlaying(true);
      onPlayStateChange?.(true);
      if (playerState.currentTrack) {
        analytics.trackPlay(playerState.currentTrack, playerState.currentTime);
      }
    },
    onPause: () => {
      playerState.setIsPlaying(false);
      onPlayStateChange?.(false);
      if (playerState.currentTrack) {
        analytics.trackPause(playerState.currentTrack, playerState.currentTime);
      }
    },
    onEnded: handleTrackEnd,
    volume: playerState.volume,
    playbackRate: playerState.playbackSpeed,
    startTime: playerState.currentTrack ? playerState.getResumeTime(playerState.currentTrack) : 0
  });

  // Listen for external events
  useEffect(() => {
    const handleMiniPlayerPlayPause = () => togglePlayPause();
    const handleMiniPlayerNext = () => handleNext();
    const handleMiniPlayerPrevious = () => handlePrevious();
    const handleMiniPlayerSeek = (event: CustomEvent) => {
      const newTime = event.detail;
      seek(newTime);
      playerState.setCurrentTime(newTime);
    };

    const handleSearchSelection = (event: CustomEvent) => {
      const { track, type } = event.detail;
      if (type === 'audio') {
        selectTrack(track);
        setTimeout(() => play(), 100);
      }
    };

    window.addEventListener('miniPlayerPlayPause', handleMiniPlayerPlayPause);
    window.addEventListener('miniPlayerNext', handleMiniPlayerNext);
    window.addEventListener('miniPlayerPrevious', handleMiniPlayerPrevious);
    window.addEventListener('miniPlayerSeek', handleMiniPlayerSeek as EventListener);
    window.addEventListener('searchTrackSelected', handleSearchSelection as EventListener);

    return () => {
      window.removeEventListener('miniPlayerPlayPause', handleMiniPlayerPlayPause);
      window.removeEventListener('miniPlayerNext', handleMiniPlayerNext);
      window.removeEventListener('miniPlayerPrevious', handleMiniPlayerPrevious);
      window.removeEventListener('miniPlayerSeek', handleMiniPlayerSeek as EventListener);
      window.removeEventListener('searchTrackSelected', handleSearchSelection as EventListener);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdownTime > 0) {
      countdownRef.current = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            pause();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [countdownTime]);

  const selectTrack = (track: AudioTrack) => {
    const index = playlist.findIndex(t => t.id === track.id);
    if (index !== -1) {
      playerState.setCurrentTrack(track, index);
      onTrackPlay?.(track, index);
    }
  };

  const handleTrackSelect = (track: AudioTrack, index: number) => {
    playerState.setCurrentTrack(track, index);
    setShowPlaylist(false);
    onTrackPlay?.(track, index);
    setTimeout(() => play(), 100);
  };

  function handleTrackEnd() {
    if (playerState.currentTrack) {
      analytics.trackComplete(playerState.currentTrack);
    }

    if (playerState.repeatMode === 'one') {
      seek(0);
      play();
    } else if (playerState.repeatMode === 'all' || playlist.length > 1) {
      // Handle track delay
      if (trackDelay > 0) {
        delayRef.current = setTimeout(() => {
          handleNext();
        }, trackDelay * 1000);
      } else {
        handleNext();
      }
    }
  }

  const handleNext = () => {
    if (playlist.length === 0) return;
    
    if (playerState.currentTrack) {
      analytics.trackSkip(playerState.currentTrack, playerState.currentTime);
    }

    let nextIndex;
    if (playerState.isShuffling) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (playerState.currentIndex + 1) % playlist.length;
    }

    const nextTrack = playlist[nextIndex];
    playerState.setCurrentTrack(nextTrack, nextIndex);
    onTrackPlay?.(nextTrack, nextIndex);
    setTimeout(() => play(), 100);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;

    let prevIndex;
    if (playerState.isShuffling) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = playerState.currentIndex === 0 ? playlist.length - 1 : playerState.currentIndex - 1;
    }

    const prevTrack = playlist[prevIndex];
    playerState.setCurrentTrack(prevTrack, prevIndex);
    onTrackPlay?.(prevTrack, prevIndex);
    setTimeout(() => play(), 100);
  };

  const togglePlayPause = () => {
    if (isPaused()) {
      play();
    } else {
      pause();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    playerState.setVolume(value[0]);
  };

  const handleSpeedChange = (value: number[]) => {
    playerState.setPlaybackSpeed(value[0]);
  };

  const handleSeek = (value: number[]) => {
    if (playerState.duration) {
      const newTime = (value[0] / 100) * playerState.duration;
      seek(newTime);
      playerState.setCurrentTime(newTime);
    }
  };

  const handleSkipForward = (seconds: number) => {
    const newTime = Math.min(playerState.currentTime + seconds, playerState.duration);
    seek(newTime);
    playerState.setCurrentTime(newTime);
  };

  const handleSkipBackward = (seconds: number) => {
    const newTime = Math.max(playerState.currentTime - seconds, 0);
    seek(newTime);
    playerState.setCurrentTime(newTime);
  };

  const handlePlaylistReorder = (reorderedTracks: AudioTrack[]) => {
    setPlaylist(reorderedTracks);
    // Update current index to match new position
    if (playerState.currentTrack) {
      const newIndex = reorderedTracks.findIndex(t => t.id === playerState.currentTrack?.id);
      if (newIndex !== -1) {
        playerState.updateState({ currentIndex: newIndex });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || hlsLoading) {
    return (
      <div className="h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-music-text">Loading audio player...</div>
      </div>
    );
  }

  if (hlsError) {
    return (
      <div className="h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center text-music-text">
          <p className="text-lg mb-2">Audio Player Error</p>
          <p className="text-sm text-music-text/70">{hlsError}</p>
        </div>
      </div>
    );
  }

  if (!playerState.currentTrack) {
    return (
      <div className="h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-music-text">No audio tracks available</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-main relative overflow-hidden">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="text-center">
          <h1 className="text-lg font-bold text-music-text mb-2">TAPYOCA AUDIO</h1>
          <p className="text-sm text-music-text/70">Enhanced Audio Experience</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-20 px-4 sm:px-6 h-full flex flex-col items-center justify-center">
        {/* Album Cover */}
        <div className="mb-4 relative">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-music-dark rounded-lg shadow-warm overflow-hidden">
            <img 
              src={playerState.currentTrack.cover_image_url || '/placeholder-cover.jpg'} 
              alt={formatTitle(playerState.currentTrack.title)}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-cover.jpg';
              }}
            />
          </div>
          {playerState.currentTrack.has_shopping_cart && (
            <Button 
              size="icon" 
              className="absolute top-2 right-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-music-text mb-2">
            {formatTitle(playerState.currentTrack.title)}
          </h2>
          <p className="text-music-text/70 text-sm sm:text-base">
            {playerState.currentTrack.artist?.name && playerState.currentTrack.artist?.name !== 'N/A'
              ? playerState.currentTrack.artist?.name
              : 'Unknown Artist'}
          </p>
        </div>

        {/* Main Playback Controls */}
        <div className="w-full max-w-md space-y-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="w-12 h-12"
            >
              <HiOutlineBackward className="w-6 h-6" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={togglePlayPause}
              className="w-14 h-14"
            >
              {playerState.isPlaying ? 
                <HiOutlinePause className="w-7 h-7" /> : 
                <HiOutlinePlay className="w-7 h-7" />
              }
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="w-12 h-12"
            >
              <HiOutlineForward className="w-6 h-6" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-music-text/70">
              <span>{formatTime(playerState.currentTime)}</span>
              <span>{formatTime(playerState.duration)}</span>
            </div>
            <Slider
              value={[playerState.duration ? (playerState.currentTime / playerState.duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <HiOutlineVolumeOff className="w-4 h-4 text-music-text/70" />
            <Slider
              value={[playerState.volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <HiOutlineVolumeUp className="w-4 h-4 text-music-text/70" />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-3">
            <BsSpeedometer2 className="w-4 h-4 text-music-text/70" />
            <Slider
              value={[playerState.playbackSpeed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-music-text/70 w-8">{playerState.playbackSpeed}x</span>
          </div>
        </div>

        {/* Enhanced Controls */}
        {showAdvancedControls && (
          <div className="w-full max-w-md mb-6">
            <TrackControls
              currentTrack={playerState.currentTrack}
              currentTime={playerState.currentTime}
              duration={playerState.duration}
              onSkipForward={handleSkipForward}
              onSkipBackward={handleSkipBackward}
              onShowLyrics={() => setShowLyrics(true)}
              countdownTime={countdownTime}
              onCountdownChange={setCountdownTime}
            />
          </div>
        )}

        {/* Secondary Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-center pb-4">
          <Button
            variant={playerState.isShuffling ? "default" : "outline"}
            size="icon"
            onClick={() => playerState.setIsShuffling(!playerState.isShuffling)}
            className="w-10 h-10"
          >
            <BiShuffle className="w-5 h-5" />
          </Button>
          
          <Button
            variant={playerState.repeatMode !== 'none' ? "default" : "outline"}
            size="icon"
            onClick={() => {
              if (playerState.repeatMode === 'none') playerState.setRepeatMode('all');
              else if (playerState.repeatMode === 'all') playerState.setRepeatMode('one');
              else playerState.setRepeatMode('none');
            }}
            className="w-10 h-10 relative"
          >
            <BiRepeat className="w-5 h-5" />
            {playerState.repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">1</span>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="w-10 h-10"
          >
            <HiOutlineQueueList className="w-5 h-5" />
          </Button>

          <Button
            variant={showAdvancedControls ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="px-3"
          >
            More
          </Button>
        </div>
      </div>

      {/* Draggable Playlist */}
      {showPlaylist && (
        <DraggablePlaylist
          tracks={playlist}
          currentIndex={playerState.currentIndex}
          onTrackSelect={handleTrackSelect}
          onTrackReorder={handlePlaylistReorder}
          onClose={() => setShowPlaylist(false)}
        />
      )}

      {/* Lyrics Display */}
      <LyricsDisplay
        track={playerState.currentTrack}
        currentTime={playerState.currentTime}
        isVisible={showLyrics}
        onClose={() => setShowLyrics(false)}
      />
    </div>
  );
};
