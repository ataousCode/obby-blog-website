import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    postId: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Prevent runtime-dependent code during build
    if (!process.env.DATABASE_URL) {
      console.warn('Database not available during build')
      return NextResponse.json({ isBookmarked: false }, { status: 200 })
    }

    if (!prisma) {
      return NextResponse.json({ isBookmarked: false }, { status: 200 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { isBookmarked: false },
        { status: 200 }
      )
    }

    const { postId } = params

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    return NextResponse.json(
      { isBookmarked: !!bookmark },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error checking bookmark status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}