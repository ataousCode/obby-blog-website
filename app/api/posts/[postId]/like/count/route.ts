import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    postId: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = params

    const count = await prisma.like.count({
      where: {
        postId: postId
      }
    })

    return NextResponse.json(
      { count },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching like count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}