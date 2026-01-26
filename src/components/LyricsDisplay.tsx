import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AudioTrack } from '@/hooks/useSupabaseData';

interface LyricsDisplayProps {
  track: AudioTrack | null;
  currentTime: number;
  isVisible: boolean;
  onClose: () => void;
}

interface LyricLine {
  time: number;
  text: string;
}

// Mock lyrics data - in real app, this would come from API or database
const mockLyrics: Record<string, LyricLine[]> = {
  'default': [
    { time: 0, text: '[Verse 1]' },
    { time: 5, text: 'This is where the lyrics would appear' },
    { time: 10, text: 'Synchronized with the audio playback' },
    { time: 15, text: 'Each line highlighted as it plays' },
    { time: 20, text: '' },
    { time: 25, text: '[Chorus]' },
    { time: 30, text: 'The lyrics display follows the music' },
    { time: 35, text: 'Creating an immersive experience' },
    { time: 40, text: 'For the listening audience' },
    { time: 45, text: '' },
    { time: 50, text: '[Verse 2]' },
    { time: 55, text: 'More lyrics would continue here' },
    { time: 60, text: 'Throughout the entire song' },
  ]
};

export const LyricsDisplay = ({ track, currentTime, isVisible, onClose }: LyricsDisplayProps) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    if (track) {
      // In a real app, fetch lyrics from API or database
      setLyrics(mockLyrics['default'] || []);
    }
  }, [track]);

  useEffect(() => {
    if (lyrics.length === 0) return;

    // Find the current line based on time
    let lineIndex = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) {
        lineIndex = i;
      } else {
        break;
      }
    }
    setCurrentLineIndex(lineIndex);
  }, [currentTime, lyrics]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-gradient-dark/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-music-text-light">Lyrics</h3>
          {track && (
            <p className="text-sm text-music-text-light/70">
              {track.title} - {track.artist?.name || 'Unknown Artist'}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-music-text-light hover:bg-music-text-light/10"
        >
          ×
        </Button>
      </div>

      {/* Lyrics Content */}
      <ScrollArea className="flex-1 p-4">
        {lyrics.length > 0 ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {lyrics.map((line, index) => (
              <div
                key={index}
                className={`text-lg leading-relaxed transition-all duration-300 ${
                  index === currentLineIndex
                    ? 'text-primary font-semibold scale-110 transform'
                    : index < currentLineIndex
                    ? 'text-music-text-light/60'
                    : 'text-music-text-light/40'
                } ${
                  line.text.startsWith('[') && line.text.endsWith(']')
                    ? 'font-bold text-center text-primary/80 text-xl'
                    : 'text-center'
                }`}
              >
                {line.text || '\u00A0'} {/* Non-breaking space for empty lines */}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-music-text-light/50">
              <p className="text-lg mb-2">No lyrics available</p>
              <p className="text-sm">
                Lyrics for this track haven't been added yet
              </p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer with sync info */}
      <div className="p-4 border-t border-border bg-music-dark/50">
        <div className="text-center text-sm text-music-text-light/70">
          {lyrics.length > 0 && (
            <>
              Line {currentLineIndex + 1} of {lyrics.length}
              {currentTime > 0 && (
                <span className="ml-4">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};