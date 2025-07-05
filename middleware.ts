import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Only protect specific admin routes, allow everything else
  if (pathname.startsWith('/admin') ||
      pathname.startsWith('/write') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/my-posts')) {
    
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET
      })
      
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }
  
  if (pathname.startsWith('/profile')) {
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET
      })
      
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/write/:path*',
    '/dashboard/:path*',
    '/my-posts/:path*',
    '/profile/:path*'
  ]
}