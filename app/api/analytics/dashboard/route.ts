import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getAnalyticsOverview,
  getPopularPosts,
  getTrafficSources,
  getDeviceBreakdown,
  getDailyAnalytics,
  getRealTimeMetrics
} from '@/lib/analytics'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    // Get all analytics data using utility functions
    const [overview, popularPosts, trafficSources, deviceBreakdown, dailyAnalytics, realTimeMetrics] = await Promise.all([
      getAnalyticsOverview(days),
      getPopularPosts(),
      getTrafficSources(days),
      getDeviceBreakdown(days),
      getDailyAnalytics(days),
      getRealTimeMetrics()
    ])

    return NextResponse.json({
      overview,
      popularPosts,
      trafficSources,
      deviceBreakdown,
      dailyAnalytics,
      realTimeMetrics
    })
  } catch (error) {
    console.error('Analytics dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}