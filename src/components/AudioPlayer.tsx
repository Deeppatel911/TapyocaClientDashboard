import { useState, useRef, useEffect, useCallback } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useSupabaseData, AudioTrack } from '@/hooks/useSupabaseData';
import { usePlayerState } from '@/hooks/usePlayerState';
import { LyricsDisplay } from './LyricsDisplay';
import { ShoppingCartIcon } from './ShoppingCartIcon';
import { DraggablePlaylist } from './DraggablePlaylist';
import { HiOutlineQueueList, HiOutlinePlay, HiOutlinePause, HiOutlineBackward, HiOutlineForward } from 'react-icons/hi2';
import { BiShuffle, BiRepeat } from 'react-icons/bi';
import { BsSpeedometer2 } from 'react-icons/bs';
import { HiOutlineVolumeUp, HiOutlineVolumeOff, HiOutlineClock } from 'react-icons/hi';
import { HiOutlineMusicalNote } from 'react-icons/hi2';
import { formatTitle } from '@/lib/utils';
import { toast } from 'sonner';

interface AudioPlayerProps {
  onTrackPlay?: (track: AudioTrack, index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const AudioPlayer = ({ onTrackPlay, onPlayStateChange, onTimeUpdate }: AudioPlayerProps = {}) => {
  const { audioTracks, isLoading } = useSupabaseData();
  const playerState = usePlayerState();
  
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([1]);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [orderedTracks, setOrderedTracks] = useState<AudioTrack[]>([]);
  
  // New enhanced features
  const [skipInterval, setSkipInterval] = useState(15); // seconds
  const [showSkipSettings, setShowSkipSettings] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0); // sleep timer in seconds
  const [showCountdown, setShowCountdown] = useState(false);
  const [delayBetweenTracks, setDelayBetweenTracks] = useState(0); // seconds
  const [showLyrics, setShowLyrics] = useState(false);
  const [hasRestoredState, setHasRestoredState] = useState(false);
  
  const audioRef = useRef<H5AudioPlayer>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize ordered tracks from audioTracks
  useEffect(() => {
    if (audioTracks.length > 0 && orderedTracks.length === 0) {
      setOrderedTracks(audioTracks);
    }
  }, [audioTracks, orderedTracks.length]);

  // Restore player state from localStorage on mount
  useEffect(() => {
    if (orderedTracks.length > 0 && !hasRestoredState && playerState.currentTrack) {
      // Find the saved track in current tracks
      const savedTrackIndex = orderedTracks.findIndex(t => t.id === playerState.currentTrack?.id);
      
      if (savedTrackIndex !== -1) {
        const savedTrack = orderedTracks[savedTrackIndex];
        setCurrentTrack(savedTrack);
        setCurrentIndex(savedTrackIndex);
        setVolume([playerState.volume]);
        setPlaybackSpeed([playerState.playbackSpeed]);
        setRepeatMode(playerState.repeatMode);
        setIsShuffling(playerState.isShuffling);
        
        // Restore playback position after audio loads
        const resumeTime = playerState.getResumeTime(savedTrack as any);
        if (resumeTime > 0) {
          setTimeout(() => {
            const audio = audioRef.current?.audio?.current;
            if (audio) {
              audio.currentTime = resumeTime;
              setCurrentTime(resumeTime);
              toast.info(`Resuming from ${Math.floor(resumeTime / 60)}:${Math.floor(resumeTime % 60).toString().padStart(2, '0')}`);
            }
          }, 500);
        }
      }
      setHasRestoredState(true);
    } else if (orderedTracks.length > 0 && !hasRestoredState && !playerState.currentTrack) {
      // No saved state, set first track
      setCurrentTrack(orderedTracks[0]);
      setCurrentIndex(0);
      setHasRestoredState(true);
    }
  }, [orderedTracks, hasRestoredState, playerState]);

  // Save player state periodically
  useEffect(() => {
    if (currentTrack) {
      playerState.updateState({
        currentTrack: currentTrack as any,
        currentIndex,
        currentTime,
        duration,
        isPlaying,
        volume: volume[0],
        playbackSpeed: playbackSpeed[0],
        repeatMode,
        isShuffling,
      });
    }
  }, [currentTrack, currentIndex, currentTime, duration, isPlaying, volume, playbackSpeed, repeatMode, isShuffling]);

  // Handle track reordering from draggable playlist
  const handleTrackReorder = (reorderedTracks: AudioTrack[]) => {
    setOrderedTracks(reorderedTracks);
    // Update current index based on current track's new position
    if (currentTrack) {
      const newIndex = reorderedTracks.findIndex(t => t.id === currentTrack.id);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
      }
    }
    toast.success('Playlist order updated');
  };

  // Countdown timer logic
  useEffect(() => {
    if (countdownTime > 0 && isPlaying) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            // Stop playback when timer ends
            const audio = audioRef.current?.audio?.current;
            if (audio) {
              audio.pause();
              setIsPlaying(false);
              onPlayStateChange?.(false);
            }
            toast.info('Sleep timer ended - playback stopped');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countdownTime > 0, isPlaying]);

  // Listen for mini-player events
  useEffect(() => {
    const handleMiniPlayerPlayPause = () => {
      togglePlayPause();
    };

    const handleMiniPlayerNext = () => {
      handleNext();
    };

    const handleMiniPlayerPrevious = () => {
      handlePrevious();
    };

    const handleMiniPlayerSeek = (event: CustomEvent) => {
      const newTime = event.detail;
      const audio = audioRef.current?.audio?.current;
      if (audio) {
        audio.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    window.addEventListener('miniPlayerPlayPause', handleMiniPlayerPlayPause);
    window.addEventListener('miniPlayerNext', handleMiniPlayerNext);
    window.addEventListener('miniPlayerPrevious', handleMiniPlayerPrevious);
    window.addEventListener('miniPlayerSeek', handleMiniPlayerSeek as EventListener);

    return () => {
      window.removeEventListener('miniPlayerPlayPause', handleMiniPlayerPlayPause);
      window.removeEventListener('miniPlayerNext', handleMiniPlayerNext);
      window.removeEventListener('miniPlayerPrevious', handleMiniPlayerPrevious);
      window.removeEventListener('miniPlayerSeek', handleMiniPlayerSeek as EventListener);
    };
  }, []);

  // Listen for search selections
  useEffect(() => {
    const handleSearchSelection = (event: CustomEvent) => {
      const { track, type, index } = event.detail;
      if (type === 'audio') {
        setCurrentTrack(track);
        setCurrentIndex(index || 0);
        // Auto-play the selected track
        setTimeout(() => {
          const audio = audioRef.current?.audio?.current;
          if (audio) {
            audio.play();
            setIsPlaying(true);
            onPlayStateChange?.(true);
          }
        }, 100);
      }
    };

    window.addEventListener('searchTrackSelected', handleSearchSelection as EventListener);
    return () => {
      window.removeEventListener('searchTrackSelected', handleSearchSelection as EventListener);
    };
  }, []);

  const handleTrackSelect = (track: AudioTrack, index: number) => {
    setCurrentTrack(track);
    setCurrentIndex(index);
    setShowPlaylist(false);
    onTrackPlay?.(track, index);
    // Auto-play the selected track
    setTimeout(() => {
      const audio = audioRef.current?.audio?.current;
      if (audio) {
        audio.play();
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }
    }, 100);
  };

  const handleNext = useCallback(() => {
    if (orderedTracks.length === 0) return;
    
    const playNextTrack = () => {
      let nextIndex;
      if (isShuffling) {
        nextIndex = Math.floor(Math.random() * orderedTracks.length);
      } else {
        nextIndex = (currentIndex + 1) % orderedTracks.length;
      }
      setCurrentTrack(orderedTracks[nextIndex]);
      setCurrentIndex(nextIndex);
      onTrackPlay?.(orderedTracks[nextIndex], nextIndex);
      
      setTimeout(() => {
        const audio = audioRef.current?.audio?.current;
        if (audio) {
          audio.play();
          setIsPlaying(true);
          onPlayStateChange?.(true);
        }
      }, 100);
    };

    // Apply delay between tracks if set
    if (delayBetweenTracks > 0) {
      toast.info(`Next track in ${delayBetweenTracks} seconds...`);
      setTimeout(playNextTrack, delayBetweenTracks * 1000);
    } else {
      playNextTrack();
    }
  }, [orderedTracks, currentIndex, isShuffling, delayBetweenTracks, onTrackPlay, onPlayStateChange]);

  const handlePrevious = useCallback(() => {
    if (orderedTracks.length === 0) return;
    let prevIndex;
    if (isShuffling) {
      prevIndex = Math.floor(Math.random() * orderedTracks.length);
    } else {
      prevIndex = currentIndex === 0 ? orderedTracks.length - 1 : currentIndex - 1;
    }
    setCurrentTrack(orderedTracks[prevIndex]);
    setCurrentIndex(prevIndex);
    onTrackPlay?.(orderedTracks[prevIndex], prevIndex);
    // Auto-play the previous track
    setTimeout(() => {
      const audio = audioRef.current?.audio?.current;
      if (audio) {
        audio.play();
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }
    }, 100);
  }, [orderedTracks, currentIndex, isShuffling, onTrackPlay, onPlayStateChange]);

  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current?.audio?.current?.play();
    } else if (repeatMode === 'all' || currentIndex < audioTracks.length - 1) {
      handleNext();
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current?.audio?.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      const newPlayState = !isPlaying;
      setIsPlaying(newPlayState);
      onPlayStateChange?.(newPlayState);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    const audio = audioRef.current?.audio?.current;
    if (audio) {
      audio.volume = value[0];
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setPlaybackSpeed(value);
    const audio = audioRef.current?.audio?.current;
    if (audio) {
      audio.playbackRate = value[0];
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current?.audio?.current;
    if (audio && duration) {
      const newTime = (value[0] / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Skip forward/backward by custom seconds
  const handleSkipForward = () => {
    const audio = audioRef.current?.audio?.current;
    if (audio) {
      const newTime = Math.min(audio.currentTime + skipInterval, duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkipBackward = () => {
    const audio = audioRef.current?.audio?.current;
    if (audio) {
      const newTime = Math.max(audio.currentTime - skipInterval, 0);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle buy button click - open purchase modal or external shop
  const handleBuyClick = (track: AudioTrack) => {
    // Check if track has a shop URL in metadata (you can extend AudioTrack type for this)
    const shopUrl = (track as any).shop_url;
    
    if (shopUrl) {
      // Open external shop URL
      window.open(shopUrl, '_blank', 'noopener,noreferrer');
      toast.success(`Opening shop for "${formatTitle(track.title)}"...`);
    } else {
      // Show purchase dialog/modal - for now redirect to a placeholder
      toast.info(`Purchase "${formatTitle(track.title)}" - Coming soon!`, {
        description: 'This feature will be available shortly.',
        action: {
          label: 'Notify Me',
          onClick: () => toast.success('You will be notified when this track is available for purchase!'),
        },
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="h-screen bg-gradient-main flex items-center justify-center">
      <div className="text-foreground">Loading...</div>
    </div>;
  }

  if (!currentTrack) {
    return <div className="h-screen bg-gradient-main flex items-center justify-center">
      <div className="text-foreground">No audio tracks available</div>
    </div>;
  }

  return (
    <div className="h-screen bg-transparent relative overflow-hidden">
      {/* Lyrics Display Overlay */}
      <LyricsDisplay 
        track={currentTrack}
        currentTime={currentTime}
        isVisible={showLyrics}
        onClose={() => setShowLyrics(false)}
      />

      {/* Header */}
      <div className="absolute top-16 left-0 right-0 p-4 z-10">
        <div className="text-center">
          <h1 className="text-lg font-bold text-foreground mb-2">ALL POINTS WEST</h1>
          <p className="text-sm text-muted-foreground">DISTILLERY, NEWARK NJ</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-28 px-4 sm:px-6 h-full flex flex-col items-center justify-center">
        {/* Album Cover with Buy Button */}
        <div className="mb-4 relative">
          <div className="w-36 h-36 sm:w-48 sm:h-48 bg-secondary rounded-lg shadow-warm overflow-hidden">
            <img 
              src={currentTrack.cover_image_url || '/placeholder-cover.jpg'} 
              alt={formatTitle(currentTrack.title)}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-cover.jpg';
              }}
            />
          </div>
          {/* Buy Button */}
          {currentTrack.has_shopping_cart && (
            <div className="absolute -top-2 -right-2">
              <ShoppingCartIcon 
                onClick={() => handleBuyClick(currentTrack)}
                className="bg-primary text-primary-foreground rounded-full shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">{formatTitle(currentTrack.title)}</h2>
          <p className="text-muted-foreground text-sm">{currentTrack.artist?.name || 'Unknown Artist'}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Main playback controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSkipBackward}
            className="w-10 h-10"
            title={`Skip back ${skipInterval}s`}
          >
            <span className="text-xs font-medium">-{skipInterval}</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            className="w-11 h-11"
          >
            <HiOutlineBackward className="w-5 h-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={togglePlayPause}
            className="w-14 h-14"
          >
            {isPlaying ? <HiOutlinePause className="w-7 h-7" /> : <HiOutlinePlay className="w-7 h-7" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="w-11 h-11"
          >
            <HiOutlineForward className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSkipForward}
            className="w-10 h-10"
            title={`Skip forward ${skipInterval}s`}
          >
            <span className="text-xs font-medium">+{skipInterval}</span>
          </Button>
        </div>

        {/* Volume & Speed Controls */}
        <div className="w-full max-w-md space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <HiOutlineVolumeOff className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <HiOutlineVolumeUp className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3">
            <BsSpeedometer2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={playbackSpeed}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{playbackSpeed[0]}x</span>
          </div>
        </div>

        {/* Secondary Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
          <Button
            variant={isShuffling ? "default" : "outline"}
            size="icon"
            onClick={() => setIsShuffling(!isShuffling)}
            className="w-9 h-9"
          >
            <BiShuffle className="w-4 h-4" />
          </Button>
          
          <Button
            variant={repeatMode !== 'none' ? "default" : "outline"}
            size="icon"
            onClick={() => {
              if (repeatMode === 'none') setRepeatMode('all');
              else if (repeatMode === 'all') setRepeatMode('one');
              else setRepeatMode('none');
            }}
            className="w-9 h-9 relative"  
          >
            <BiRepeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-primary-foreground text-[8px] rounded-full flex items-center justify-center">1</span>
            )}
          </Button>

          {/* Lyrics Button */}
          <Button
            variant={showLyrics ? "default" : "outline"}
            size="icon"
            onClick={() => setShowLyrics(!showLyrics)}
            className="w-9 h-9"
            title="Show lyrics"
          >
            <HiOutlineMusicalNote className="w-4 h-4" />
          </Button>

          {/* Sleep Timer Button */}
          <Button
            variant={countdownTime > 0 ? "default" : "outline"}
            size="icon"
            onClick={() => setShowCountdown(!showCountdown)}
            className="w-9 h-9 relative"
            title="Sleep timer"
          >
            <HiOutlineClock className="w-4 h-4" />
            {countdownTime > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[8px] rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </Button>

          {/* Skip Settings Button */}
          <Button
            variant={showSkipSettings ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSkipSettings(!showSkipSettings)}
            className="h-9 px-2"
            title="Skip & delay settings"
          >
            <span className="text-xs">{skipInterval}s</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="w-9 h-9"
          >
            <HiOutlineQueueList className="w-4 h-4" />
          </Button>
        </div>

        {/* Skip & Delay Settings Panel */}
        {showSkipSettings && (
          <Card className="w-full max-w-md p-3 mt-2 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Skip interval</span>
                <span>{skipInterval}s</span>
              </div>
              <Slider
                value={[skipInterval]}
                onValueChange={(v) => setSkipInterval(v[0])}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Delay between tracks</span>
                <span>{delayBetweenTracks}s</span>
              </div>
              <Slider
                value={[delayBetweenTracks]}
                onValueChange={(v) => setDelayBetweenTracks(v[0])}
                min={0}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
          </Card>
        )}

        {/* Countdown Timer Panel */}
        {showCountdown && (
          <Card className="w-full max-w-md p-3 mt-2 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Sleep Timer</span>
              {countdownTime > 0 && (
                <span className="text-sm text-primary font-mono">{formatCountdown(countdownTime)}</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 15, 30, 60].map((mins) => (
                <Button
                  key={mins}
                  variant={countdownTime === mins * 60 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCountdownTime(mins * 60)}
                >
                  {mins}m
                </Button>
              ))}
            </div>
            {countdownTime > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCountdownTime(0)}
                className="w-full"
              >
                Cancel Timer
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Hidden Audio Player for functionality */}
      <div className="hidden">
        <H5AudioPlayer
          ref={audioRef}
          src={currentTrack.audio_url}
          onClickNext={handleNext}
          onClickPrevious={handlePrevious}
          onEnded={handleEnded}
          onPlay={() => {
            setIsPlaying(true);
            onPlayStateChange?.(true);
          }}
          onPause={() => {
            setIsPlaying(false);
            onPlayStateChange?.(false);
          }}
          onLoadedMetaData={() => {
            const audio = audioRef.current?.audio?.current;
            if (audio) {
              setDuration(audio.duration);
              audio.volume = volume[0];
              audio.playbackRate = playbackSpeed[0];
              onTimeUpdate?.(0, audio.duration);
            }
          }}
          onListen={(e) => {
            const currentTime = (e.target as HTMLAudioElement).currentTime;
            setCurrentTime(currentTime);
            onTimeUpdate?.(currentTime, duration);
          }}
          showSkipControls={false}
          showJumpControls={false}
          customProgressBarSection={[]}
          customControlsSection={[]}
          className="music-player"
          style={{ display: 'none' }}
        />
      </div>

      {/* Draggable Playlist Overlay */}
      {showPlaylist && (
        <DraggablePlaylist
          tracks={orderedTracks}
          currentIndex={currentIndex}
          onTrackSelect={handleTrackSelect}
          onTrackReorder={handleTrackReorder}
          onClose={() => setShowPlaylist(false)}
        />
      )}
    </div>
  );
};
