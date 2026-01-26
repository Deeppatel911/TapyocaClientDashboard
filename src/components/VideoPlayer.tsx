
import { useState, useRef, useEffect } from 'react';
import { Player } from 'video-react';
import 'video-react/dist/video-react.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSupabaseData, VideoTrack } from '@/hooks/useSupabaseData';
import { usePlayerState } from '@/hooks/usePlayerState';
import { DraggableVideoPlaylist } from './DraggableVideoPlaylist';
import { HiOutlineQueueList, HiOutlinePlay, HiOutlinePause, HiOutlineArrowsPointingOut, HiOutlineBackward, HiOutlineForward, HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from 'react-icons/hi2';
import { formatTitle } from '@/lib/utils';
import { toast } from 'sonner';

interface VideoPlayerProps {
  onTrackPlay?: (track: VideoTrack, index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const VideoPlayer = ({ onTrackPlay, onPlayStateChange, onTimeUpdate }: VideoPlayerProps = {}) => {
  const { videoTracks, isLoading } = useSupabaseData();
  const playerState = usePlayerState();
  
  const [currentVideo, setCurrentVideo] = useState<VideoTrack | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderedVideos, setOrderedVideos] = useState<VideoTrack[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([1]);
  const [isMuted, setIsMuted] = useState(false);
  const [hasRestoredState, setHasRestoredState] = useState(false);

  const playerRef = useRef<Player>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video player state storage key (separate from audio)
  const VIDEO_STORAGE_KEY = 'tapyoca_video_player_state';

  // Initialize ordered videos when tracks load
  useEffect(() => {
    if (videoTracks.length > 0 && orderedVideos.length === 0) {
      setOrderedVideos(videoTracks);
    }
  }, [videoTracks, orderedVideos.length]);

  // Restore video player state from localStorage on mount
  useEffect(() => {
    if (orderedVideos.length > 0 && !hasRestoredState) {
      try {
        const savedState = localStorage.getItem(VIDEO_STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          const savedVideoIndex = orderedVideos.findIndex(v => v.id === parsed.currentVideoId);
          
          if (savedVideoIndex !== -1) {
            const savedVideo = orderedVideos[savedVideoIndex];
            setCurrentVideo(savedVideo);
            setCurrentIndex(savedVideoIndex);
            setVolume([parsed.volume ?? 1]);
            setPlaybackSpeed([parsed.playbackSpeed ?? 1]);
            
            // Restore playback position
            const timeSinceLastPlay = Date.now() - (parsed.lastPlayedTimestamp || 0);
            const resumeTimeLimit = 30 * 60 * 1000; // 30 minutes
            
            if (parsed.currentTime > 30 && timeSinceLastPlay < resumeTimeLimit) {
              setTimeout(() => {
                const video = playerRef.current?.video?.video;
                if (video) {
                  video.currentTime = parsed.currentTime;
                  setCurrentTime(parsed.currentTime);
                  toast.info(`Resuming from ${Math.floor(parsed.currentTime / 60)}:${Math.floor(parsed.currentTime % 60).toString().padStart(2, '0')}`);
                }
              }, 500);
            }
          } else {
            setCurrentVideo(orderedVideos[0]);
            setCurrentIndex(0);
          }
        } else {
          setCurrentVideo(orderedVideos[0]);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Failed to restore video player state:', error);
        setCurrentVideo(orderedVideos[0]);
        setCurrentIndex(0);
      }
      setHasRestoredState(true);
    }
  }, [orderedVideos, hasRestoredState]);

  // Save video player state periodically
  useEffect(() => {
    if (currentVideo) {
      try {
        localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify({
          currentVideoId: currentVideo.id,
          currentIndex,
          currentTime,
          duration,
          isPlaying,
          volume: volume[0],
          playbackSpeed: playbackSpeed[0],
          lastPlayedTimestamp: Date.now(),
        }));
      } catch (error) {
        console.error('Failed to save video player state:', error);
      }
    }
  }, [currentVideo, currentIndex, currentTime, duration, isPlaying, volume, playbackSpeed]);

  // Listen for mini-player events
  useEffect(() => {
    const handleMiniPlayerPlayPause = () => {
      const video = playerRef.current?.video?.video;
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }
    };

    const handleMiniPlayerNext = () => {
      handleNext();
    };

    const handleMiniPlayerPrevious = () => {
      handlePrevious();
    };

    const handleMiniPlayerSeek = (event: CustomEvent) => {
      const newTime = event.detail;
      const video = playerRef.current?.video?.video;
      if (video) {
        video.currentTime = newTime;
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

  // Listen for search selections (auto-play)
  useEffect(() => {
    const handleSearchSelection = (event: CustomEvent) => {
      const { track, type, index } = event.detail;
      if (type === 'video') {
        setCurrentVideo(track);
        setCurrentIndex(index || 0);
        setTimeout(() => {
          const videoElement = playerRef.current?.video?.video;
          if (videoElement) {
            videoElement.play().catch(console.error);
          }
        }, 100);
      }
    };

    window.addEventListener('searchTrackSelected', handleSearchSelection as EventListener);
    return () => {
      window.removeEventListener('searchTrackSelected', handleSearchSelection as EventListener);
    };
  }, []);

  const handleVideoSelect = (video: VideoTrack, index: number) => {
    setCurrentVideo(video);
    setCurrentIndex(index);
    setShowPlaylist(false);
    onTrackPlay?.(video, index);
    // Auto-play the selected video
    setTimeout(() => {
      const videoElement = playerRef.current?.video?.video;
      if (videoElement) {
        videoElement.play().catch(console.error);
      }
    }, 100);
  };

  const handleNext = () => {
    if (orderedVideos.length === 0) return;
    const nextIndex = (currentIndex + 1) % orderedVideos.length;
    setCurrentVideo(orderedVideos[nextIndex]);
    setCurrentIndex(nextIndex);
    onTrackPlay?.(orderedVideos[nextIndex], nextIndex);
    setTimeout(() => {
      const videoElement = playerRef.current?.video?.video;
      if (videoElement) {
        videoElement.play().catch(console.error);
      }
    }, 100);
  };

  const handlePrevious = () => {
    if (orderedVideos.length === 0) return;
    const prevIndex = currentIndex === 0 ? orderedVideos.length - 1 : currentIndex - 1;
    setCurrentVideo(orderedVideos[prevIndex]);
    setCurrentIndex(prevIndex);
    onTrackPlay?.(orderedVideos[prevIndex], prevIndex);
    setTimeout(() => {
      const videoElement = playerRef.current?.video?.video;
      if (videoElement) {
        videoElement.play().catch(console.error);
      }
    }, 100);
  };

  const handleVideoReorder = (reorderedVideos: VideoTrack[]) => {
    setOrderedVideos(reorderedVideos);
    // Update current index based on current video's new position
    const newIndex = reorderedVideos.findIndex(v => v.id === currentVideo?.id);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  };

  const handleFullScreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
      return;
    }

    if (container.requestFullscreen) {
      container.requestFullscreen().catch(console.error);
    } else if ((container as any).webkitRequestFullscreen) {
      (container as any).webkitRequestFullscreen();
    } else if ((container as any).mozRequestFullScreen) {
      (container as any).mozRequestFullScreen();
    } else if ((container as any).msRequestFullscreen) {
      (container as any).msRequestFullscreen();
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setPlaybackSpeed(value);
    const video = playerRef.current?.video?.video;
    if (video) {
      video.playbackRate = value[0];
    }
  };

  const handleSeek = (value: number[]) => {
    const video = playerRef.current?.video?.video;
    if (!video || duration === 0) return;
    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    const video = playerRef.current?.video?.video;
    if (video) {
      video.volume = value[0];
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    const video = playerRef.current?.video?.video;
    if (video) {
      if (isMuted) {
        video.volume = volume[0] > 0 ? volume[0] : 1;
        setIsMuted(false);
        if (volume[0] === 0) setVolume([1]);
      } else {
        video.volume = 0;
        setIsMuted(true);
      }
    }
  };

  if (isLoading) {
    return <div className="h-screen bg-gradient-main flex items-center justify-center">
      <div className="text-music-text">Loading...</div>
    </div>;
  }

  if (!currentVideo) {
    return <div className="h-screen bg-gradient-main flex items-center justify-center">
      <div className="text-music-text">No video tracks available</div>
    </div>;
  }

  return (
    <div className="h-screen bg-transparent relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="text-center">
          <h1 className="text-lg font-bold text-music-text mb-2">SPONSORS</h1>
          <h2 className="text-lg font-bold text-music-text mb-2">&</h2>
          <h3 className="text-lg font-bold text-music-text">PARTNERS</h3>
        </div>
      </div>

      {/* Main Content - Account for bottom navigation */}
      <div className="pt-16 pb-28 px-4 h-full flex flex-col">
        {/* Video Player */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <div
            ref={containerRef}
            className="w-full max-w-lg bg-black rounded-lg shadow-warm overflow-hidden relative"
          >
            <Player
              ref={playerRef}
              playsInline
              poster={currentVideo.thumbnail_url || '/placeholder-thumbnail.jpg'}
              src={currentVideo.video_url}
              className="video-player"
              fluid={false}
              width="100%"
              height={280}
              preload="metadata"
              controls={false}
              onLoadedMetadata={() => {
                const video = playerRef.current?.video?.video;
                if (video) {
                  video.playbackRate = playbackSpeed[0];
                  setDuration(video.duration || 0);
                }
              }}
              onPlay={() => {
                setIsPlaying(true);
                onPlayStateChange?.(true);
              }}
              onPause={() => {
                setIsPlaying(false);
                onPlayStateChange?.(false);
              }}
              onTimeUpdate={() => {
                const video = playerRef.current?.video?.video;
                if (video) {
                  setCurrentTime(video.currentTime);
                  setDuration(video.duration || 0);
                  onTimeUpdate?.(video.currentTime, video.duration);
                }
              }}
            />

            {/* Custom controls overlay - hide when playlist is open */}
            {!showPlaylist && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 z-10 pointer-events-auto">
              {/* Progress / Seek */}
              <div className="mb-2">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                  aria-label="Seek"
                />
                <div className="flex justify-between text-[10px] text-white/80 mt-1">
                  <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                  <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Previous button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="bg-black/70 text-white hover:bg-black/90 h-8 w-8 flex-shrink-0 rounded-full p-0 border border-white/20"
                  aria-label="Previous video"
                >
                  <HiOutlineBackward className="w-4 h-4" />
                </Button>

                {/* Play/Pause button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const video = playerRef.current?.video?.video;
                    if (video) {
                      if (video.paused) {
                        video.play().catch(console.error);
                        setIsPlaying(true);
                      } else {
                        video.pause();
                        setIsPlaying(false);
                      }
                    }
                  }}
                  className="bg-black/70 text-white hover:bg-black/90 h-10 w-10 flex-shrink-0 rounded-full p-0 border border-white/20"
                  aria-label="Play or pause"
                >
                  {isPlaying ? <HiOutlinePause className="w-5 h-5" /> : <HiOutlinePlay className="w-5 h-5" />}
                </Button>

                {/* Next button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="bg-black/70 text-white hover:bg-black/90 h-8 w-8 flex-shrink-0 rounded-full p-0 border border-white/20"
                  aria-label="Next video"
                >
                  <HiOutlineForward className="w-4 h-4" />
                </Button>

                {/* Speed control */}
                <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
                  <span className="text-[10px] text-white/90 min-w-[18px] text-right font-medium">{playbackSpeed[0]}x</span>
                  <Slider
                    value={playbackSpeed}
                    onValueChange={handleSpeedChange}
                    min={0.25}
                    max={2}
                    step={0.25}
                    className="w-10"
                    aria-label="Playback speed"
                  />
                </div>

                {/* Volume control */}
                <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="bg-transparent text-white hover:bg-black/50 h-6 w-6 p-0"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <HiOutlineSpeakerXMark className="w-4 h-4" /> : <HiOutlineSpeakerWave className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={isMuted ? [0] : volume}
                    onValueChange={handleVolumeChange}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-12"
                    aria-label="Volume"
                  />
                </div>

                {/* Fullscreen button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullScreen();
                  }}
                  className="bg-black/70 text-white hover:bg-black/90 h-8 w-8 flex-shrink-0 rounded-full p-0 border border-white/20"
                  aria-label="Fullscreen"
                >
                  <HiOutlineArrowsPointingOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-music-text mb-1">{formatTitle(currentVideo.title)}</h2>
          <p className="text-music-text/70 text-sm">{currentVideo.artist?.name || 'Unknown Artist'}</p>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-center gap-4 pb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="w-10 h-10"
          >
            <HiOutlineQueueList className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Draggable Playlist Overlay */}
      {showPlaylist && (
        <DraggableVideoPlaylist
          videos={orderedVideos}
          currentIndex={currentIndex}
          onVideoSelect={handleVideoSelect}
          onVideoReorder={handleVideoReorder}
          onClose={() => setShowPlaylist(false)}
        />
      )}
    </div>
  );
};
