import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define public routes that don't need authentication
const publicRoutes = [
  '/',
  '/posts',
  '/about',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password'
]

// Define static asset patterns
const staticAssetPatterns = [
  '/_next',
  '/favicon',
  '/images',
  '/static',
  '/api/auth'
]

// Define protected routes that require admin access
const adminRoutes = [
  '/admin',
  '/write',
  '/dashboard',
  '/my-posts',
  '/categories'
]

export async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname
    
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware executing for:', pathname)
    }
    
    // Skip middleware for static assets and API auth routes
    if (staticAssetPatterns.some(pattern => pathname.startsWith(pattern)) ||
        pathname.includes('.') ||
        pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    
    // Allow public routes
    if (publicRoutes.includes(pathname) ||
        pathname.startsWith('/posts/') ||
        pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }
    
    // Check authentication for protected routes
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    })
    
    // Handle admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!token || token.role !== 'ADMIN') {
        const signInUrl = new URL('/auth/signin', req.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }
    }
    
    // Handle profile route (requires any authenticated user)
    if (pathname.startsWith('/profile')) {
      if (!token) {
        const signInUrl = new URL('/auth/signin', req.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to continue to prevent blocking
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}