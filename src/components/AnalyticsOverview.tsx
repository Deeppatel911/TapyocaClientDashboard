import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { HiOutlineMusicalNote, HiOutlinePlay, HiOutlineClock, HiOutlineHeart } from 'react-icons/hi2';
import { formatTitle } from '@/lib/utils';

// Format duration in seconds to MM:SS format
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AnalyticsOverview = () => {
  const { data, isLoading, error } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
          <p className="text-red-600">Error loading analytics: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatListeningTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Plays Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Plays
          </CardTitle>
          <HiOutlinePlay className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(data.totalPlays)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            All time plays
          </p>
        </CardContent>
      </Card>

      {/* Total Listening Time Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Listening Time
          </CardTitle>
          <HiOutlineClock className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatListeningTime(data.totalListeningTime)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Total duration
          </p>
        </CardContent>
      </Card>

      {/* Favorite Track Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Favorite Track
          </CardTitle>
          <HiOutlineHeart className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          {data.favoriteTrack ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900 truncate">
                {data.favoriteTrack.title}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {data.favoriteTrack.artist}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {formatNumber(data.favoriteTrack.playCount)} plays
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {data.favoriteTrack.trackType}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Average Session Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Avg. Duration
          </CardTitle>
          <HiOutlineMusicalNote className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {data.totalPlays > 0 
              ? formatDuration(Math.floor(data.totalListeningTime / data.totalPlays))
              : '0:00'
            }
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Per track average
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
