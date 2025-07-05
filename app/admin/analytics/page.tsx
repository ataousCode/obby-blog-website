'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


import { 
  Eye, 
  Users, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  Activity
} from 'lucide-react'
import { AnalyticsChart, MetricCard } from '@/components/analytics-chart'

interface AnalyticsData {
  overview: {
    totalViews: number
    uniqueVisitors: number
    totalSessions: number
    avgSessionTime: number
    bounceRate: number
  }
  dailyAnalytics: Array<{
    date: string
    views: number
  }>
  realTimeMetrics: {
    activeUsers: number
    recentViews: number
  }
  period: string
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      redirect('/auth/signin')
    }
  }, [session, status])

  useEffect(() => {
    fetchAnalyticsData()
  }, [period])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const response = await fetch(`/api/analytics/dashboard?days=${days}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      // Analytics data fetch failed silently
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load analytics data</h1>
          <Button onClick={fetchAnalyticsData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Site Analytics</h1>
          <p className="text-gray-600 mt-2">Monitor site performance and user engagement</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <MetricCard
          title="Active Users"
          value={analyticsData.realTimeMetrics.activeUsers}
          icon={<Users className="h-4 w-4 text-green-600" />}
          description="Currently active users (24h)"
        />
        
        <MetricCard
          title="Recent Views"
          value={analyticsData.realTimeMetrics.recentViews}
          icon={<Eye className="h-4 w-4 text-purple-600" />}
          description="Views in last 24 hours"
        />
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <MetricCard
          title="Total Views"
          value={analyticsData.overview.totalViews.toLocaleString()}
          icon={<Eye className="h-4 w-4" />}
          description="Page views in selected period"
        />
        
        <MetricCard
          title="Unique Visitors"
          value={analyticsData.overview.uniqueVisitors.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          description="Unique visitors in selected period"
        />
        
        <MetricCard
          title="Total Sessions"
          value={analyticsData.overview.totalSessions.toLocaleString()}
          icon={<Activity className="h-4 w-4" />}
          description="User sessions in selected period"
        />
        
        <MetricCard
          title="Avg. Session Time"
          value={formatDuration(analyticsData.overview.avgSessionTime)}
          icon={<Clock className="h-4 w-4" />}
          description="Average time spent per session"
        />
        
        <MetricCard
          title="Bounce Rate"
          value={`${analyticsData.overview.bounceRate}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Percentage of single-page sessions"
        />
      </div>

      {/* Charts */}
      <div className="mb-8">
        {/* Daily Page Views Chart */}
        <AnalyticsChart
          data={analyticsData.dailyAnalytics}
          title="Daily Page Views"
          dataKey="views"
          color="#3b82f6"
        />
      </div>
    </div>
  )
}