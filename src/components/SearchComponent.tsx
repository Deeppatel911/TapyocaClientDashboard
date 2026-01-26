
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseData, AudioTrack, VideoTrack } from '@/hooks/useSupabaseData';
import { HiOutlineMusicalNote, HiOutlineVideoCamera, HiOutlinePlay, HiOutlineMagnifyingGlass, HiOutlineArrowLeft } from 'react-icons/hi2';
import { formatTitle } from '@/lib/utils';

interface SearchComponentProps {
  onClose: () => void;
  onAudioPlay?: (track: AudioTrack, playlist: AudioTrack[], index: number, fromSearch?: boolean) => void;
  onVideoPlay?: (track: VideoTrack, playlist: VideoTrack[], index: number, fromSearch?: boolean) => void;
  onTabChange?: (tab: string) => void;
}

export const SearchComponent = ({ onClose, onAudioPlay, onVideoPlay, onTabChange }: SearchComponentProps) => {
  const { audioTracks, videoTracks } = useSupabaseData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<Array<{
    item: AudioTrack | VideoTrack;
    type: 'audio' | 'video';
    originalIndex: number;
  }>>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{ item: AudioTrack | VideoTrack; type: 'audio' | 'video'; originalIndex: number }> = [];

    // Search audio tracks
    audioTracks.forEach((track, index) => {
      if (
        track.title.toLowerCase().includes(query) ||
        track.artist?.name?.toLowerCase().includes(query)
      ) {
        results.push({ item: track, type: 'audio', originalIndex: index });
      }
    });

    // Search video tracks
    videoTracks.forEach((track, index) => {
      if (
        track.title.toLowerCase().includes(query) ||
        track.artist?.name?.toLowerCase().includes(query)
      ) {
        results.push({ item: track, type: 'video', originalIndex: index });
      }
    });

    setFilteredResults(results);
  }, [searchQuery, audioTracks, videoTracks]);

  const dispatchSelectionEvent = (detail: { track: any; type: 'audio' | 'video'; index: number }) => {
    // Broadcast to players so they can auto-play
    window.dispatchEvent(new CustomEvent('searchTrackSelected', { detail }));
  };

  const handleAudioSelect = (track: AudioTrack, index: number) => {
    if (onTabChange) onTabChange('audio');
    // Ensure tab switch before play
    setTimeout(() => {
      dispatchSelectionEvent({ track, type: 'audio', index });
      onAudioPlay?.(track, [], index, true);
    }, 100);
    onClose();
  };

  const handleVideoSelect = (track: VideoTrack, index: number) => {
    if (onTabChange) onTabChange('video');
    setTimeout(() => {
      dispatchSelectionEvent({ track, type: 'video', index });
      onVideoPlay?.(track, [], index, true);
    }, 100);
    onClose();
  };

  return (
    <div className="h-screen bg-gradient-main relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-music-text hover:bg-music-text/10"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-music-text">Search</h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="pt-20 px-4">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-music-text/50" />
          <Input
            type="text"
            placeholder="Search tracks, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background text-music-text border-music-border"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4 pb-20 h-full">
        <ScrollArea className="h-full">
          {filteredResults.length === 0 && searchQuery.trim() !== '' && (
            <div className="text-center py-8">
              <p className="text-music-text/70">No results found for "{searchQuery}"</p>
            </div>
          )}
          
          {filteredResults.length === 0 && searchQuery.trim() === '' && (
            <div className="text-center py-8">
              <HiOutlineMagnifyingGlass className="w-12 h-12 text-music-text/30 mx-auto mb-4" />
              <p className="text-music-text/70">Start typing to search tracks...</p>
            </div>
          )}

          <div className="space-y-2">
            {filteredResults.map((result, index) => (
              <Card
                key={`${result.type}-${result.item.id}-${index}`}
                className="p-3 cursor-pointer transition-all duration-200 bg-playlist-item hover:bg-playlist-item-hover text-music-text-light"
                onClick={() => {
                  if (result.type === 'audio') {
                    handleAudioSelect(result.item as AudioTrack, result.originalIndex);
                  } else {
                    handleVideoSelect(result.item as VideoTrack, result.originalIndex);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-music-dark rounded overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={
                        result.type === 'audio' 
                          ? (result.item as AudioTrack).cover_image_url || '/placeholder-cover.jpg'
                          : (result.item as VideoTrack).thumbnail_url || '/placeholder-thumbnail.jpg'
                      }
                      alt={formatTitle(result.item.title)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = result.type === 'audio' 
                          ? '/placeholder-cover.jpg' 
                          : '/placeholder-thumbnail.jpg';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {result.type === 'audio' ? (
                        <HiOutlineMusicalNote className="w-4 h-4 text-white/80" />
                      ) : (
                        <HiOutlinePlay className="w-4 h-4 text-white/80" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{formatTitle(result.item.title)}</p>
                      {result.type === 'audio' ? (
                        <HiOutlineMusicalNote className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <HiOutlineVideoCamera className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs opacity-70 truncate">
                      {result.item.artist?.name && result.item.artist?.name !== 'N/A' ? result.item.artist?.name : 'Unknown Artist'}
                    </p>
                  </div>
                  
                  <div className="text-xs">
                    {/* Hide duration when unavailable */}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
