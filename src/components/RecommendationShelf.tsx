import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { HiOutlineSparkles, HiOutlinePlay } from 'react-icons/hi2';
import { useRecommendations, RecommendationCandidate } from '@/hooks/useRecommendations';
import { formatTitle } from '@/lib/utils';

interface ShelfTrack {
  id: string;
  title: string;
  artist?: { name?: string } | null;
}

interface RecommendationShelfProps {
  tracks: ShelfTrack[];
  currentTrackId?: string;
  onSelect: (trackId: string) => void;
}

/**
 * "Recommended for you" shelf shown above the playlist on the Audio/Video tabs.
 * Scoped to whatever tracks the host player passes in (so it stays audio-only on
 * the Audio tab, video-only on the Video tab) and only ever suggests tracks the
 * player can actually play.
 */
export const RecommendationShelf = ({ tracks, currentTrackId, onSelect }: RecommendationShelfProps) => {
  const candidates: RecommendationCandidate[] = useMemo(
    () =>
      tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist?.name || 'Unknown Artist',
      })),
    [tracks]
  );

  const recommendations = useRecommendations(candidates);

  // Don't suggest the track that's already playing.
  const visible = recommendations.filter((r) => r.trackId !== currentTrackId).slice(0, 6);

  if (visible.length === 0) return null;

  return (
    <Card className="w-full max-w-md mt-4 p-3">
      <div className="flex items-center gap-2 mb-3">
        <HiOutlineSparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Recommended for you</h3>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {visible.map((rec) => (
            <button
              key={rec.trackId}
              type="button"
              onClick={() => onSelect(rec.trackId)}
              className="group w-40 flex-shrink-0 text-left rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/40 transition-colors p-3"
            >
              <div className="flex items-center justify-center w-full h-16 rounded-md bg-primary/10 mb-2">
                <HiOutlinePlay className="w-6 h-6 text-primary opacity-70 group-hover:opacity-100" />
              </div>
              <p className="text-sm font-medium truncate">{formatTitle(rec.title)}</p>
              <p className="text-xs text-muted-foreground truncate">{rec.artist}</p>
              <Badge variant="outline" className="mt-2 text-[10px] font-normal max-w-full truncate">
                {rec.reason}
              </Badge>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};
