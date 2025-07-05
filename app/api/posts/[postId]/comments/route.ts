import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
  parentId: z.string().optional()
})

interface RouteParams {
  params: {
    postId: string
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const { postId } = params
    const body = await req.json()
    
    // Validate request body
    const validationResult = createCommentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { content, parentId } = validationResult.data

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }

      if (parentComment.postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to this post' },
          { status: 400 }
        )
      }
    }

    // Create comment
    console.log('Creating comment with data:', {
      content,
      postId,
      authorId: session.user.id,
      parentId: parentId || null
    })
    
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
        ...(parentId ? { parentId } : {})
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    })

    console.log('Comment created successfully:', comment)

    return NextResponse.json(
      { 
        message: 'Comment created successfully',
        comment 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const { postId } = params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const skip = (page - 1) * limit

    console.log('Fetching comments for postId:', postId)

    // Debug: Get all comments for this post
    const allComments = await prisma.comment.findMany({
      where: { postId }
    });
    console.log(`[DEBUG] All comments for post ${postId}:`, JSON.stringify(allComments, null, 2));
    console.log(`[DEBUG] Total comments found: ${allComments.length}`);
    allComments.forEach((comment, index) => {
      console.log(`[DEBUG] Comment ${index + 1}: parentId = ${comment.parentId} (type: ${typeof comment.parentId}), content = ${comment.content.substring(0, 50)}...`);
    });
    
    // Debug: Test different parentId queries - removed empty string test to avoid ObjectID error

    // Get top-level comments with their replies
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: { isSet: false }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
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
            createdAt: 'asc'
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
    })

    const totalComments = await prisma.comment.count({
      where: {
        postId,
        parentId: { isSet: false }
      }
    })

    console.log('Found comments:', comments.length, 'Total:', totalComments)
    console.log('Comments data:', comments)

    const totalPages = Math.ceil(totalComments / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total: totalComments,
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