import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { db } from './db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { verify } from 'jsonwebtoken'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: process.env.EMAIL_SECURE === 'true',
      },
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'john@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
        otpToken: {
          label: 'OTP Token',
          type: 'text',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // Handle OTP token authentication
        if (credentials.otpToken) {
          try {
            const jwtSecret = process.env.NEXTAUTH_SECRET || 'fallback-secret'
            const decoded = verify(credentials.otpToken, jwtSecret) as any
            
            if (decoded.email !== credentials.email || !decoded.verified) {
              return null
            }

            const user = await db.user.findUnique({
              where: { email: credentials.email },
            })

            if (!user) {
              return null
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              isSubscribed: user.isSubscribed,
            }
          } catch (error) {
            return null
          }
        }

        // Handle password authentication
        if (!credentials.password) {
          return null
        }

        const { email, password } = loginSchema.parse(credentials)

        const user = await db.user.findUnique({
          where: {
            email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isSubscribed: user.isSubscribed,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        return {
          ...token,
          role: (user as any).role,
          isSubscribed: (user as any).isSubscribed,
        }
      }
      
      // Update token when session is updated
      if (trigger === 'update' && session) {
        return {
          ...token,
          ...session,
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Use token data instead of database calls to avoid middleware issues
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          isSubscribed: token.isSubscribed,
        },
      }
    },
  },
}