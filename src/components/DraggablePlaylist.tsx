import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AudioTrack } from '@/hooks/useSupabaseData';
import { ShoppingCartIcon } from './ShoppingCartIcon';
import { HiOutlineBars3 } from 'react-icons/hi2';
import { formatTitle } from '@/lib/utils';
import { toast } from 'sonner';

interface DraggablePlaylistProps {
  tracks: AudioTrack[];
  currentIndex: number;
  onTrackSelect: (track: AudioTrack, index: number) => void;
  onTrackReorder: (tracks: AudioTrack[]) => void;
  onClose: () => void;
}

export const DraggablePlaylist = ({ 
  tracks, 
  currentIndex, 
  onTrackSelect, 
  onTrackReorder,
  onClose 
}: DraggablePlaylistProps) => {
  const [isReordering, setIsReordering] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onTrackReorder(items);
    setIsReordering(false);
  };

  const handleDragStart = () => {
    setIsReordering(true);
  };

  // Handle buy button click
  const handleBuyClick = (track: AudioTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    const shopUrl = (track as any).shop_url;
    
    if (shopUrl) {
      window.open(shopUrl, '_blank', 'noopener,noreferrer');
      toast.success(`Opening shop for "${formatTitle(track.title)}"...`);
    } else {
      toast.info(`Purchase "${formatTitle(track.title)}" - Coming soon!`, {
        description: 'This feature will be available shortly.',
        action: {
          label: 'Notify Me',
          onClick: () => toast.success('You will be notified when this track is available for purchase!'),
        },
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-dark/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-music-text-light">Playlist</h3>
          <span className="text-sm text-music-text-light/70">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''}
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
          Drag tracks to reorder your playlist
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <Droppable droppableId="playlist">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-primary/10' : ''
                  }`}
                >
                  {tracks.map((track, index) => (
                    <Draggable 
                      key={track.id} 
                      draggableId={track.id} 
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
                          onClick={() => !isReordering && onTrackSelect(track, index)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing"
                            >
                              <HiOutlineBars3 className="w-4 h-4 text-music-text-light/50" />
                            </div>

                            {/* Track Number */}
                            <div className="w-6 text-sm font-mono text-music-text-light/50">
                              {index + 1}
                            </div>

                            {/* Album Art */}
                            <div className="w-12 h-12 bg-music-dark rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={track.cover_image_url || '/placeholder-cover.jpg'} 
                                alt={track.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-cover.jpg';
                                }}
                              />
                            </div>

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{track.title}</p>
                              <p className="text-xs opacity-70 truncate">
                                {track.artist?.name || 'Unknown Artist'}
                              </p>
                            </div>

                            {/* Track Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs">
                                {track.duration 
                                  ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` 
                                  : ''
                                }
                              </span>
                              {track.has_shopping_cart && (
                                <ShoppingCartIcon 
                                  onClick={(e) => handleBuyClick(track, e as React.MouseEvent)}
                                  className="opacity-70 hover:opacity-100"
                                />
                              )}
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
          <span>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
          <span>Currently playing: {currentIndex + 1} of {tracks.length}</span>
        </div>
      </div>
    </div>
  );
};