import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioTrack } from '@/hooks/useSupabaseData';
import { 
  HiOutlineForward,
  HiOutlineBackward,
  HiOutlineMusicalNote,
  HiOutlineClock
} from 'react-icons/hi2';

interface TrackControlsProps {
  currentTrack: AudioTrack | null;
  currentTime: number;
  duration: number;
  onSkipForward: (seconds: number) => void;
  onSkipBackward: (seconds: number) => void;
  onShowLyrics?: () => void;
  countdownTime?: number;
  onCountdownChange?: (seconds: number) => void;
}

export const TrackControls = ({
  currentTrack,
  currentTime,
  duration,
  onSkipForward,
  onSkipBackward,
  onShowLyrics,
  countdownTime = 0,
  onCountdownChange
}: TrackControlsProps) => {
  const [skipInterval, setSkipInterval] = useState([15]); // Default 15 seconds
  const [showCountdown, setShowCountdown] = useState(false);

  const handleSkipForward = () => {
    onSkipForward(skipInterval[0]);
  };

  const handleSkipBackward = () => {
    onSkipBackward(skipInterval[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    if (!duration || !currentTime) return '0:00';
    const remaining = Math.max(0, duration - currentTime);
    return formatTime(remaining);
  };

  const getCountdownDisplay = () => {
    if (countdownTime <= 0) return null;
    return formatTime(countdownTime);
  };

  return (
    <div className="space-y-4">
      {/* Skip Controls */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipBackward}
            className="flex items-center gap-1"
          >
            <HiOutlineBackward className="w-4 h-4" />
            <span className="text-xs">{skipInterval[0]}s</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipForward}
            className="flex items-center gap-1"
          >
            <span className="text-xs">{skipInterval[0]}s</span>
            <HiOutlineForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Lyrics Button */}
        {onShowLyrics && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowLyrics}
            className="flex items-center gap-1"
          >
            <HiOutlineMusicalNote className="w-4 h-4" />
            <span className="text-xs">Lyrics</span>
          </Button>
        )}

        {/* Countdown Timer */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCountdown(!showCountdown)}
          className="flex items-center gap-1"
        >
          <HiOutlineClock className="w-4 h-4" />
          <span className="text-xs">
            {countdownTime > 0 ? getCountdownDisplay() : 'Timer'}
          </span>
        </Button>
      </div>

      {/* Skip Interval Control */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-music-text/70">
          <span>Skip interval</span>
          <span>{skipInterval[0]}s</span>
        </div>
        <Slider
          value={skipInterval}
          onValueChange={setSkipInterval}
          min={5}
          max={60}
          step={5}
          className="w-full"
        />
      </div>

      {/* Countdown Control */}
      {showCountdown && (
        <div className="space-y-2 p-3 bg-music-dark/30 rounded-lg">
          <div className="flex justify-between text-xs text-music-text/70">
            <span>Sleep timer</span>
            <span>{countdownTime > 0 ? getCountdownDisplay() : 'Off'}</span>
          </div>
          <Slider
            value={[countdownTime]}
            onValueChange={(value) => onCountdownChange?.(value[0])}
            min={0}
            max={3600} // 1 hour max
            step={60} // 1 minute steps
            className="w-full"
          />
          <div className="flex justify-between text-xs text-music-text/70">
            <span>Off</span>
            <span>1 hour</span>
          </div>
        </div>
      )}

      {/* Track Progress Info */}
      <div className="text-center space-y-1">
        <div className="text-sm text-music-text/70">
          Remaining: {getRemainingTime()}
        </div>
        {duration > 0 && (
          <div className="text-xs text-music-text/50">
            Progress: {Math.round((currentTime / duration) * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};