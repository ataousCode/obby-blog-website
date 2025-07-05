import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Prevent runtime-dependent code during build
    if (!process.env.DATABASE_URL) {
      console.warn('Database not available during build')
      return NextResponse.json({ error: 'Database not available during build' }, { status: 503 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get current date and last month date
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    // Get total counts
    const [totalUsers, totalPosts, totalComments, totalViews, totalLikes] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { publishedAt: { not: null } } }),
      prisma.comment.count(),
      prisma.post.aggregate({
        _sum: {
          views: true
        },
        where: { publishedAt: { not: null } }
      }),
      prisma.like.count()
    ])

    // Get recent counts (last month)
    const [recentUsers, recentPosts, recentComments] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      }),
      prisma.post.count({
        where: {
          publishedAt: {
            gte: lastMonth,
            not: null
          }
        }
      }),
      prisma.comment.count({
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      })
    ])

    // Get recent activity
    const [recentUsersList, recentPostsList] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          role: true
        }
      }),
      prisma.post.findMany({
        take: 5,
        where: {
          publishedAt: { not: null }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          author: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalPosts,
      totalComments,
      totalViews: totalViews._sum.views || 0,
      totalLikes,
      recentUsers,
      recentPosts,
      recentComments,
      recentActivity: {
        users: recentUsersList,
        posts: recentPostsList
      }
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}