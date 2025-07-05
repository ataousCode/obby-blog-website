import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const includePosts = searchParams.get('includePosts') === 'true'

    // Users can only access their own profile unless they're admin
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        role: true,
        createdAt: true,
        posts: includePosts ? {
          where: { 
            status: 'PUBLISHED',
            publishedAt: { not: null }
          },
          select: {
            id: true,
            title: true,
            slug: true,
            category: {
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
          },
          orderBy: { publishedAt: 'desc' }
        } : false
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let stats = null
    if (includeStats) {
      const [totalPosts, totalLikes, totalComments, totalViews] = await Promise.all([
        prisma.post.count({
          where: { 
            authorId: id, 
            status: 'PUBLISHED',
            publishedAt: { not: null }
          }
        }),
        prisma.like.count({
          where: { post: { authorId: id } }
        }),
        prisma.comment.count({
          where: { post: { authorId: id } }
        }),
        prisma.post.aggregate({
          where: { 
            authorId: id, 
            status: 'PUBLISHED',
            publishedAt: { not: null }
          },
          _sum: { views: true }
        })
      ])

      stats = {
        totalPosts,
        totalLikes,
        totalComments,
        totalViews: totalViews._sum?.views || 0
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Users can only update their own profile unless they're admin
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { name, bio, website, location, image } = body

    // Validate input
    if (name && typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid name' },
        { status: 400 }
      )
    }

    if (bio && typeof bio !== 'string') {
      return NextResponse.json(
        { error: 'Invalid bio' },
        { status: 400 }
      )
    }

    if (website && typeof website !== 'string') {
      return NextResponse.json(
        { error: 'Invalid website' },
        { status: 400 }
      )
    }

    if (location && typeof location !== 'string') {
      return NextResponse.json(
        { error: 'Invalid location' },
        { status: 400 }
      )
    }

    if (image && typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Invalid image' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(website !== undefined && { website }),
        ...(location !== undefined && { location }),
        ...(image !== undefined && { image })
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        location: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}