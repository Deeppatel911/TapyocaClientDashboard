import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AnalyticsCharts } from './AnalyticsCharts';
import { TopLists } from './TopLists';
import { AnalyticsTable } from './AnalyticsTable';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { HiOutlineArrowPath, HiOutlineChartBar, HiOutlineListBullet, HiOutlineTableCells } from 'react-icons/hi2';

export const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading, error } = useAnalyticsData();

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        
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
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Unable to load analytics
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your listening habits and discover insights about your music consumption
          </p>
        </div>
      </div>

      {/* Empty State */}
      {data && data.totalPlays === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                No analytics data yet
              </h3>
              <p className="text-blue-600 mb-4">
                Start playing some tracks to see your listening statistics and insights!
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-600">Tracks Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0:00</div>
                  <div className="text-sm text-blue-600">Listening Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-600">Favorite Tracks</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {data && data.totalPlays > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <HiOutlineChartBar className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <HiOutlineChartBar className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="toplists" className="flex items-center gap-2">
              <HiOutlineListBullet className="h-4 w-4" />
              Top Lists
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <HiOutlineTableCells className="h-4 w-4" />
              Detailed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-6">
              <AnalyticsOverview />
              <AnalyticsCharts />
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <AnalyticsCharts />
          </TabsContent>

          <TabsContent value="toplists" className="space-y-6">
            <TopLists />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <AnalyticsTable />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
