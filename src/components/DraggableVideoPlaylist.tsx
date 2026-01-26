import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { VideoTrack } from '@/hooks/useSupabaseData';
import { HiOutlineBars3, HiOutlinePlay } from 'react-icons/hi2';
import { formatTitle } from '@/lib/utils';

interface DraggableVideoPlaylistProps {
  videos: VideoTrack[];
  currentIndex: number;
  onVideoSelect: (video: VideoTrack, index: number) => void;
  onVideoReorder: (videos: VideoTrack[]) => void;
  onClose: () => void;
}

export const DraggableVideoPlaylist = ({ 
  videos, 
  currentIndex, 
  onVideoSelect, 
  onVideoReorder,
  onClose 
}: DraggableVideoPlaylistProps) => {
  const [isReordering, setIsReordering] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onVideoReorder(items);
    setIsReordering(false);
  };

  const handleDragStart = () => {
    setIsReordering(true);
  };

  return (
    <div className="absolute inset-0 bg-gradient-dark/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-music-text-light">Video Playlist</h3>
          <span className="text-sm text-music-text-light/70">
            {videos.length} video{videos.length !== 1 ? 's' : ''}
          </span>
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
      
      <div className="p-4 border-b border-border">
        <p className="text-sm text-music-text-light/70">
          Drag videos to reorder your playlist
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <Droppable droppableId="video-playlist">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-primary/10' : ''
                  }`}
                >
                  {videos.map((video, index) => (
                    <Draggable 
                      key={video.id} 
                      draggableId={video.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 mb-2 cursor-pointer transition-all duration-200 ${
                            snapshot.isDragging
                              ? 'shadow-warm scale-105 bg-primary/20'
                              : currentIndex === index
                              ? 'bg-primary text-primary-foreground shadow-warm'
                              : 'bg-playlist-item hover:bg-playlist-item-hover text-music-text-light'
                          } ${
                            isReordering ? 'pointer-events-none' : ''
                          }`}
                          onClick={() => !isReordering && onVideoSelect(video, index)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing"
                            >
                              <HiOutlineBars3 className="w-4 h-4 text-music-text-light/50" />
                            </div>

                            {/* Video Number */}
                            <div className="w-6 text-sm font-mono text-music-text-light/50">
                              {index + 1}
                            </div>

                            {/* Thumbnail */}
                            <div className="w-16 h-12 bg-music-dark rounded overflow-hidden flex-shrink-0 relative">
                              <img 
                                src={video.thumbnail_url || '/placeholder-thumbnail.jpg'} 
                                alt={formatTitle(video.title)}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-thumbnail.jpg';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <HiOutlinePlay className="w-5 h-5 text-white/80" />
                              </div>
                            </div>

                            {/* Video Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{formatTitle(video.title)}</p>
                              <p className="text-xs opacity-70 truncate">
                                {video.artist?.name || 'Unknown Artist'}
                              </p>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs">
                                {video.duration 
                                  ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` 
                                  : ''
                                }
                              </span>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </ScrollArea>

      {/* Playlist Stats */}
      <div className="p-4 border-t border-border bg-music-dark/50">
        <div className="flex justify-between text-sm text-music-text-light/70">
          <span>{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
          <span>Currently playing: {currentIndex + 1} of {videos.length}</span>
        </div>
      </div>
    </div>
  );
};
