import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { HiOutlineMusicalNote, HiOutlineVideoCamera, HiOutlinePlay, HiOutlineForward, HiOutlineUser } from 'react-icons/hi2';
import { useState } from 'react';

export const TopLists = () => {
  const { data, isLoading, error } = useAnalyticsData();
  const [viewMode, setViewMode] = useState<'all' | 'audio' | 'video'>('all');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center space-x-3 mb-3">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Error loading top lists: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-2 mb-6">
        <Button
          variant={viewMode === 'all' ? 'default' : 'outline'}
          onClick={() => setViewMode('all')}
          className="flex items-center gap-2"
        >
          <HiOutlineMusicalNote className="h-4 w-4" />
          <HiOutlineVideoCamera className="h-4 w-4" />
          All Tracks
        </Button>
        <Button
          variant={viewMode === 'audio' ? 'default' : 'outline'}
          onClick={() => setViewMode('audio')}
          className="flex items-center gap-2"
        >
          <HiOutlineMusicalNote className="h-4 w-4" />
          Audio Only
        </Button>
        <Button
          variant={viewMode === 'video' ? 'default' : 'outline'}
          onClick={() => setViewMode('video')}
          className="flex items-center gap-2"
        >
          <HiOutlineVideoCamera className="h-4 w-4" />
          Video Only
        </Button>
      </div>

      {/* Most Played Tracks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HiOutlinePlay className="h-5 w-5 text-blue-600" />
            Most Played Tracks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {data.mostPlayedTracks.filter(track => 
                viewMode === 'all' || track.trackType === viewMode
              ).length > 0 ? (
                data.mostPlayedTracks.filter(track => 
                  viewMode === 'all' || track.trackType === viewMode
                ).map((track, index) => (
                  <div key={track.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {track.trackType === 'audio' ? (
                          <HiOutlineMusicalNote className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <HiOutlineVideoCamera className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium text-gray-900 truncate" title={track.title}>
                          {track.title.replace(/^(audio|video)-.*?-/, '')}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate" title={track.artist}>
                        {track.artist}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(track.playCount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDuration(track.avgListenDuration)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Most Skipped Tracks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HiOutlineForward className="h-5 w-5 text-orange-600" />
            Most Skipped Tracks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {data.mostSkippedTracks.filter(track => 
                viewMode === 'all' || track.trackType === viewMode
              ).length > 0 ? (
                data.mostSkippedTracks.filter(track => 
                  viewMode === 'all' || track.trackType === viewMode
                ).map((track, index) => (
                  <div key={track.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {track.trackType === 'audio' ? (
                          <HiOutlineMusicalNote className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <HiOutlineVideoCamera className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium text-gray-900 truncate" title={track.title}>
                          {track.title.replace(/^(audio|video)-.*?-/, '')}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate" title={track.artist}>
                        {track.artist}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {formatNumber(track.skipCount)}
                      </p>
                      <p className="text-xs text-gray-500">skips</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Favorite Artists */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <HiOutlineUser className="h-5 w-5 text-purple-600" />
            Favorite Artists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {data.favoriteArtists.length > 0 ? (
                data.favoriteArtists.map((artist, index) => (
                  <div key={artist.artistId} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate" title={artist.artistName}>
                        {artist.artistName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatNumber(artist.totalPlays)} plays
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDuration(artist.totalListeningTime)}
                      </p>
                      <p className="text-xs text-gray-500">total time</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
