
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { AudioTrack, VideoTrack } from '@/hooks/useSupabaseData';
import { HiOutlinePlay, HiOutlinePause, HiOutlineForward, HiOutlineBackward, HiOutlineXMark } from 'react-icons/hi2';
import { HiOutlineMusicalNote, HiOutlineVideoCamera } from 'react-icons/hi2';
import { formatTitle } from '@/lib/utils';

interface MiniPlayerProps {
  currentTrack: AudioTrack | VideoTrack | null;
  type: 'audio' | 'video';
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playingFromSearch?: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onExpand: () => void;
  onSeek?: (value: number[]) => void;
}

export const MiniPlayer = ({
  currentTrack,
  type,
  isPlaying,
  currentTime,
  duration,
  playingFromSearch = false,
  onPlayPause,
  onNext,
  onPrevious,
  onClose,
  onExpand,
  onSeek
}: MiniPlayerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setIsVisible(true);
    }
  }, [currentTrack]);

  if (!currentTrack || !isVisible) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const imageUrl = type === 'audio' 
    ? (currentTrack as AudioTrack).cover_image_url || '/placeholder-cover.jpg'
    : (currentTrack as VideoTrack).thumbnail_url || '/placeholder-thumbnail.jpg';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-40 bg-music-card/95 backdrop-blur-sm border-music-border shadow-warm animate-slide-in-bottom">
      <div className="p-3">
        {/* Progress bar - Interactive */}
        <Slider
          value={[progressPercent]}
          onValueChange={(value) => onSeek?.(value)}
          max={100}
          step={0.1}
          className="h-1 mb-3"
        />
        
        <div className="flex items-center gap-3">
          {/* Track info */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={onExpand}
          >
            <div className="relative w-10 h-10 bg-music-dark rounded overflow-hidden flex-shrink-0">
              <img 
                src={imageUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = type === 'audio' 
                    ? '/placeholder-cover.jpg' 
                    : '/placeholder-thumbnail.jpg';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {type === 'audio' ? (
                  <HiOutlineMusicalNote className="w-3 h-3 text-white/60" />
                ) : (
                  <HiOutlineVideoCamera className="w-3 h-3 text-white/60" />
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
<p className="font-medium text-sm text-music-text truncate">
  {formatTitle(currentTrack.title)}
</p>
              <p className="text-xs text-music-text/70 truncate">
                {currentTrack.artist?.name || 'Unknown Artist'}
              </p>
            </div>
          </div>

          {/* Time display */}
          <div className="text-xs text-music-text/70 min-w-0 flex-shrink-0">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={playingFromSearch}
              className={`w-8 h-8 p-0 text-music-text hover:bg-music-text/10 ${
                playingFromSearch ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <HiOutlineBackward className="w-4 h-4" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={onPlayPause}
              className="w-8 h-8 p-0"
            >
              {isPlaying ? (
                <HiOutlinePause className="w-4 h-4" />
              ) : (
                <HiOutlinePlay className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={playingFromSearch}
              className={`w-8 h-8 p-0 text-music-text hover:bg-music-text/10 ${
                playingFromSearch ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <HiOutlineForward className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 text-music-text hover:bg-music-text/10"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
