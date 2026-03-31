import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { HiOutlineMusicalNote, HiOutlineVideoCamera } from 'react-icons/hi2';
import { useState } from 'react';

export const AnalyticsTable = () => {
  const { data, isLoading, error } = useAnalyticsData();
  const [viewMode, setViewMode] = useState<'all' | 'audio' | 'video'>('all');

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border-b">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-5 gap-4 flex-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Error loading detailed analytics: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

      <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Detailed Analytics</CardTitle>
        <p className="text-sm text-gray-600">
          Complete breakdown of all tracked analytics data
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="overflow-x-auto">
            <div style={{ minWidth: '800px' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-900 w-64">Track</th>
                    <th className="text-left p-3 font-medium text-gray-900 w-20">Type</th>
                    <th className="text-center p-3 font-medium text-gray-900 w-16">Plays</th>
                    <th className="text-center p-3 font-medium text-gray-900 w-16">Skips</th>
                    <th className="text-center p-3 font-medium text-gray-900 w-20">Avg Duration</th>
                    <th className="text-center p-3 font-medium text-gray-900 w-24">Completion</th>
                    <th className="text-center p-3 font-medium text-gray-900 w-20">Total Time</th>
                    <th className="text-left p-3 font-medium text-gray-900 w-28">Last Played</th>
                  </tr>
                </thead>
              <tbody>
                {data.detailedAnalytics.filter(track => 
                  viewMode === 'all' || track.trackType === viewMode
                ).length > 0 ? (
                  data.detailedAnalytics.filter(track => 
                    viewMode === 'all' || track.trackType === viewMode
                  ).map((track, index) => (
                    <tr 
                      key={track.trackId} 
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="max-w-xs">
                          <div className="flex items-center gap-2 mb-1">
                            {track.trackType === 'audio' ? (
                              <HiOutlineMusicalNote className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            ) : (
                              <HiOutlineVideoCamera className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            )}
                            <p className="font-medium text-gray-900 truncate" title={track.title}>
                              {track.title.replace(/^(audio|video)-.*?-/, '')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 truncate" title={track.artist}>
                            {track.artist}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant="outline" 
                          className="text-xs flex items-center gap-1 w-fit"
                        >
                          {track.trackType === 'audio' ? (
                            <>
                              <HiOutlineMusicalNote className="h-3 w-3" />
                              Audio
                            </>
                          ) : (
                            <>
                              <HiOutlineVideoCamera className="h-3 w-3" />
                              Video
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-medium text-gray-900">
                          {formatNumber(track.playCount)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-medium ${
                          track.skipCount > 0 ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          {formatNumber(track.skipCount)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-sm text-gray-900">
                          {formatDuration(track.avgListenDuration)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-full max-w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                track.completionRate >= 80 ? 'bg-green-500' :
                                track.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${track.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                            {track.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-sm text-gray-900">
                          {formatDuration(track.totalListenTime)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">
                          {formatDate(track.lastPlayedAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No analytics data available yet. Start playing some tracks to see your listening statistics!
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </ScrollArea>
        
        {data.detailedAnalytics.filter(track => 
          viewMode === 'all' || track.trackType === viewMode
        ).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {data.detailedAnalytics.filter(track => 
                  viewMode === 'all' || track.trackType === viewMode
                ).length} tracks
              </span>
              <span>
                Total: {formatNumber(data.totalPlays)} plays, {formatDuration(data.totalListeningTime)} listening time
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};
