import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Lazy load prisma to avoid build-time database connection
const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  if (!prisma) {
    throw new Error('Prisma client not available')
  }
  return prisma
}

export async function GET(req: NextRequest) {
  try {
    // Prevent runtime-dependent code during build
    if (!process.env.DATABASE_URL) {
      console.warn('Database not available during build')
      return NextResponse.json({ error: 'Database not available during build' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const prisma = await getPrisma()
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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const skip = (page - 1) * limit

    // Get all comments with author and post information
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          _count: {
            select: {
              likes: true,
              replies: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.comment.count()
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}