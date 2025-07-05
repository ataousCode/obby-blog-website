import { prisma } from '@/lib/prisma'

export interface AnalyticsOverview {
  totalViews: number
  uniqueVisitors: number
  totalSessions: number
  averageSessionDuration: number
  bounceRate: number
  topPages: Array<{
    path: string
    views: number
    title?: string
  }>
}

export interface PopularPost {
  id: string
  title: string
  slug: string
  views: number
  likes: number
  comments: number
}

export interface TrafficSource {
  source: string
  visitors: number
  percentage: number
}

export interface DeviceBreakdown {
  device: string
  count: number
  percentage: number
}

export interface DailyAnalytics {
  date: string
  views: number
  visitors: number
  sessions: number
}

export async function getAnalyticsOverview(days: number = 30): Promise<AnalyticsOverview> {
  if (!prisma) {
    throw new Error('Database connection not available')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get total views
  const totalViews = await prisma.pageView.count({
    where: {
      createdAt: {
        gte: startDate
      }
    }
  })

  // Get unique visitors
  const uniqueVisitors = await prisma.pageView.groupBy({
    by: ['ipAddress'],
    where: {
      createdAt: {
        gte: startDate
      }
    }
  })

  // Get total sessions
  const totalSessions = await prisma.userSession.count({
    where: {
      createdAt: {
        gte: startDate
      }
    }
  })

  // Get average session duration
  const sessions = await prisma.userSession.findMany({
    where: {
      createdAt: {
        gte: startDate
      },
      duration: {
        not: null
      }
    },
    select: {
      duration: true
    }
  })

  const averageSessionDuration = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / sessions.length
    : 0

  // Calculate bounce rate (sessions with duration < 30 seconds)
  const bouncedSessions = sessions.filter(session => (session.duration || 0) < 30000).length
  const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0

  // Get top pages
  const topPagesData = await prisma.pageView.groupBy({
    by: ['path'],
    where: {
      createdAt: {
        gte: startDate
      }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 10
  })

  const topPages = topPagesData.map(page => ({
    path: page.path,
    views: page._count.id,
    title: page.path.startsWith('/posts/') ? 'Blog Post' : 'Page'
  }))

  return {
    totalViews,
    uniqueVisitors: uniqueVisitors.length,
    totalSessions,
    averageSessionDuration: Math.round(averageSessionDuration / 1000), // Convert to seconds
    bounceRate: Math.round(bounceRate),
    topPages
  }
}

export async function getPopularPosts(limit: number = 10): Promise<PopularPost[]> {
  if (!prisma) {
    throw new Error('Database connection not available')
  }

  const posts = await prisma.post.findMany({
    where: {
      publishedAt: {
        not: null
      }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: {
      views: 'desc'
    },
    take: limit
  })

  return posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    views: post.views || 0,
    likes: post._count.likes,
    comments: post._count.comments
  }))
}

export async function getTrafficSources(days: number = 30): Promise<TrafficSource[]> {
  if (!prisma) {
    throw new Error('Database connection not available')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const sources = await prisma.pageView.groupBy({
    by: ['referrer'],
    where: {
      createdAt: {
        gte: startDate
      }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  })

  const totalVisitors = sources.reduce((sum, source) => sum + source._count.id, 0)

  return sources.map(source => {
    const sourceName = source.referrer || 'Direct'
    const visitors = source._count.id
    const percentage = totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0

    return {
      source: sourceName,
      visitors,
      percentage: Math.round(percentage * 100) / 100
    }
  })
}

export async function getDeviceBreakdown(days: number = 30): Promise<DeviceBreakdown[]> {
  if (!prisma) {
    throw new Error('Database connection not available')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const devices = await prisma.pageView.groupBy({
    by: ['userAgent'],
    where: {
      createdAt: {
        gte: startDate
      }
    },
    _count: {
      id: true
    }
  })

  // Simple device detection based on user agent
  const deviceCounts = devices.reduce((acc, device) => {
    const userAgent = device.userAgent || ''
    let deviceType = 'Desktop'
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = 'Mobile'
    } else if (/Tablet|iPad/.test(userAgent)) {
      deviceType = 'Tablet'
    }
    
    acc[deviceType] = (acc[deviceType] || 0) + device._count.id
    return acc
  }, {} as Record<string, number>)

  const totalCount = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0)

  return Object.entries(deviceCounts).map(([device, count]) => ({
    device,
    count,
    percentage: totalCount > 0 ? Math.round((count / totalCount) * 100 * 100) / 100 : 0
  }))
}

export async function getDailyAnalytics(days: number = 30): Promise<DailyAnalytics[]> {
  if (!prisma) {
    throw new Error('Database connection not available')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dailyData = await prisma.pageView.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: startDate
      }
    },
    _count: {
      id: true
    }
  })

  // Group by date
  const dailyStats = dailyData.reduce((acc, item) => {
    const date = item.createdAt.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { views: 0, visitors: new Set(), sessions: new Set() }
    }
    acc[date].views += item._count.id
    return acc
  }, {} as Record<string, { views: number; visitors: Set<string>; sessions: Set<string> }>)

  // Convert to array and fill missing dates
  const result: DailyAnalytics[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const stats = dailyStats[dateStr] || { views: 0, visitors: new Set(), sessions: new Set() }
    
    result.push({
      date: dateStr,
      views: stats.views,
      visitors: stats.visitors.size,
      sessions: stats.sessions.size
    })
  }

  return result
}

export async function getRealTimeMetrics() {
  if (!prisma) {
    throw new Error('Database connection not available')
  }

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Active sessions (last hour)
  const activeSessions = await prisma.userSession.count({
    where: {
      updatedAt: {
        gte: oneHourAgo
      }
    }
  })

  // Views in last 24 hours
  const recentViews = await prisma.pageView.count({
    where: {
      createdAt: {
        gte: oneDayAgo
      }
    }
  })

  // Current online users (last 5 minutes)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  const onlineUsers = await prisma.userSession.count({
    where: {
      updatedAt: {
        gte: fiveMinutesAgo
      }
    }
  })

  return {
    activeSessions,
    recentViews,
    onlineUsers
  }
}