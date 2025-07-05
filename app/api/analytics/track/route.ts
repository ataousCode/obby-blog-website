import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface TrackingData {
  path: string
  referrer?: string
  userAgent?: string
  sessionId?: string
  userId?: string
  postId?: string
}

export async function POST(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const body = await request.json() as TrackingData
    const { path, referrer, userAgent, sessionId, userId, postId } = body

    // Get client IP and other headers
    const headersList = headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent || '')

    // Create page view record
    const pageView = await prisma.pageView.create({
      data: {
        path,
        userAgent: userAgent || null,
        ipAddress,
        referrer: referrer || null,
        country: 'Unknown', // You can integrate with IP geolocation service
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        userId: userId || null,
        postId: postId || null
      }
    })

    // Update or create user session
    if (sessionId) {
      await updateUserSession(sessionId, userId || null, deviceInfo, ipAddress, userAgent)
    }

    // Update post views if it's a post page
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          views: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({ success: true, id: pageView.id })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}

function parseUserAgent(userAgent: string) {
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'Mobile' : 'Desktop'
  
  let browser = 'Unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  
  let os = 'Unknown'
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS')) os = 'iOS'
  
  return { device, browser, os }
}

async function updateUserSession(
  sessionId: string,
  userId: string | null,
  deviceInfo: any,
  ipAddress: string,
  userAgent: string | undefined
) {
  if (!prisma) return

  const existingSession = await prisma.userSession.findUnique({
    where: { sessionId }
  })

  if (existingSession) {
    // Update existing session
    await prisma.userSession.update({
      where: { sessionId },
      data: {
        pageViews: {
          increment: 1
        },
        endTime: new Date(),
        updatedAt: new Date()
      }
    })
  } else {
    // Create new session
    await prisma.userSession.create({
      data: {
        sessionId,
        pageViews: 1,
        startTime: new Date(),
        userAgent: userAgent || null,
        ipAddress,
        country: 'Unknown',
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        userId: userId || null
      }
    })
  }
}