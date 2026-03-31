import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { HiOutlineMusicalNote, HiOutlineVideoCamera } from 'react-icons/hi2';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useState } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AnalyticsCharts = () => {
  const { data, isLoading, error } = useAnalyticsData();
  const [viewMode, setViewMode] = useState<'all' | 'audio' | 'video'>('all');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
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
          <p className="text-red-600">Error loading charts: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const filteredPlayCounts = data.playCountsByTrack.filter(track => 
    viewMode === 'all' || track.trackType === viewMode
  );
  
  const topTracksData = filteredPlayCounts.slice(0, 10).map(track => {
    // Remove audio/video prefix from display name
    const cleanTitle = track.title.replace(/^(audio|video)-.*?-/, '');
    const displayName = cleanTitle.length > 20 ? cleanTitle.substring(0, 20) + '...' : cleanTitle;
    
    return {
      name: displayName,
      fullName: track.title,
      plays: track.playCount,
      artist: track.artist,
      trackType: track.trackType
    };
  });

  const timelineData = data.listeningTimeline.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    plays: item.plays,
    listeningTime: Math.round(item.listeningTime / 60) // Convert to minutes
  }));

  const completionData = [
    { name: 'Completed', value: data.completionRates.completed, color: '#10b981' },
    { name: 'Skipped', value: data.completionRates.skipped, color: '#ef4444' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            {data.trackType === 'audio' ? (
              <HiOutlineMusicalNote className="h-4 w-4 text-blue-600" />
            ) : (
              <HiOutlineVideoCamera className="h-4 w-4 text-purple-600" />
            )}
            <p className="text-sm font-medium truncate" title={data.fullName}>
              {data.name}
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-2 truncate" title={data.artist}>
            {data.artist}
          </p>
          <p className="text-sm" style={{ color: '#3b82f6' }}>
            Plays: {data.plays}
          </p>
        </div>
      );
    }
    return null;
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Play Counts by Track - Bar Chart */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Tracks by Play Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div style={{ minWidth: '600px', width: '100%' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topTracksData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    fontSize={11}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar 
                    dataKey="plays" 
                    fill="#3b82f6" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listening Timeline - Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Listening Timeline (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="plays" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Plays"
              />
              <Line 
                type="monotone" 
                dataKey="listeningTime" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Minutes"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completion Rates - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Track Completion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {data.completionRates.completionRate}%
            </p>
            <p className="text-sm text-gray-500">
              Overall completion rate
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
