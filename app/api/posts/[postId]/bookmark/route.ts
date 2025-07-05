import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    postId: string
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const { postId } = params

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

    // Check if user already bookmarked the post
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Post already bookmarked' },
        { status: 400 }
      )
    }

    // Create bookmark
    await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        postId: postId
      }
    })

    return NextResponse.json(
      { message: 'Post bookmarked successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error bookmarking post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const { postId } = params

    // Delete bookmark
    const deletedBookmark = await prisma.bookmark.deleteMany({
      where: {
        userId: session.user.id,
        postId: postId
      }
    })

    if (deletedBookmark.count === 0) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Bookmark removed successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error removing bookmark:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}