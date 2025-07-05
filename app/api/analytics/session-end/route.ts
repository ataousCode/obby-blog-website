import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SessionEndData {
  sessionId: string
  duration: number
}

export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const body = await request.json() as SessionEndData
    const { sessionId, duration } = body

    // Update session with end time and duration
    await prisma.userSession.updateMany({
      where: {
        sessionId
      },
      data: {
        endTime: new Date(),
        duration,
        bounceRate: duration < 30 // Consider sessions under 30 seconds as bounced
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session end tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    )
  }
}