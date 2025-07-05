import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

export async function GET() {
  try {
    // Prevent runtime-dependent code during build
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not available during build' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = await getPrisma()
    const aboutPage = await prisma.aboutPage.findFirst()

    if (!aboutPage) {
      return NextResponse.json({ error: 'No about page content found' }, { status: 404 })
    }

    return NextResponse.json(aboutPage)
  } catch (error) {
    console.error('Error fetching about page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about page' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Prevent runtime-dependent code during build
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not available during build' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const {
      profileImage,
      name,
      title,
      aboutMe,
      education,
      experience,
      researchInterests,
      publications,
      contactEmail,
      contactPhone,
      contactLocation,
      blogPurpose
    } = data

    const prisma = await getPrisma()
    let aboutPage = await prisma.aboutPage.findFirst()
    
    if (aboutPage) {
      aboutPage = await prisma.aboutPage.update({
        where: { id: aboutPage.id },
        data: {
          profileImage,
          name,
          title,
          aboutMe,
          education,
          experience,
          researchInterests,
          publications,
          contactEmail,
          contactPhone,
          contactLocation,
          blogPurpose,
          updatedAt: new Date()
        }
      })
    } else {
      aboutPage = await prisma.aboutPage.create({
        data: {
          profileImage,
          name,
          title,
          aboutMe,
          education,
          experience,
          researchInterests,
          publications,
          contactEmail,
          contactPhone,
          contactLocation,
          blogPurpose
        }
      })
    }

    return NextResponse.json(aboutPage)
  } catch (error) {
    console.error('Error updating about page:', error)
    return NextResponse.json(
      { error: 'Failed to update about page' },
      { status: 500 }
    )
  }
}