import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  type: z.enum(['signup', 'signin', 'reset-password'])
})

export async function POST(request: NextRequest) {
  try {
    // Check if prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const validatedData = verifyOtpSchema.parse(body)
    const { email, otp, password, name, type } = validatedData

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Handle different verification types
    if (type === 'signup') {
      if (!password || !name) {
        return NextResponse.json(
          { error: 'Name and password are required for signup' },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Hash password and create user
      const hashedPassword = await hash(password, 12)
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerified: new Date(),
          role: 'USER'
        }
      })

      // Delete the verification token
      await prisma.verificationToken.delete({
        where: {
          id: verificationToken.id
        }
      })

      return NextResponse.json(
        { 
          message: 'Account created successfully',
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        },
        { status: 201 }
      )
    }

    if (type === 'signin') {
      // For signin, just verify the OTP and mark email as verified
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Update email verification status
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() }
      })

      // Delete the verification token
      await prisma.verificationToken.delete({
        where: {
          id: verificationToken.id
        }
      })

      // Generate a temporary JWT token for NextAuth signin
      const jwtSecret = process.env.NEXTAUTH_SECRET || 'fallback-secret'
      const token = sign(
        { 
          email: user.email,
          id: user.id,
          verified: true,
          exp: Math.floor(Date.now() / 1000) + (60 * 5) // 5 minutes
        },
        jwtSecret
      )

      return NextResponse.json(
        { 
          message: 'Email verified successfully',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        },
        { status: 200 }
      )
    }

    if (type === 'reset-password') {
      if (!password) {
        return NextResponse.json(
          { error: 'New password is required' },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Hash new password and update user
      const hashedPassword = await hash(password, 12)
      
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          emailVerified: new Date()
        }
      })

      // Delete the verification token
      await prisma.verificationToken.delete({
        where: {
          id: verificationToken.id
        }
      })

      return NextResponse.json(
        { message: 'Password reset successfully' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid verification type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('OTP verification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}