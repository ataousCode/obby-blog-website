import { withAuth } from "next-auth/middleware"
import { NextRequest } from "next/server"
import { JWT } from "next-auth/jwt"

export default withAuth(
  function middleware(req: NextRequest) {
    // Add any custom middleware logic here
    console.log('Middleware executing for:', req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token, req }: { token: JWT | null; req: NextRequest }) => {
        const pathname = req.nextUrl.pathname
        
        // Allow public routes
        if (pathname === '/' || 
            pathname.startsWith('/posts') || 
            pathname.startsWith('/auth') || 
            pathname.startsWith('/api/auth') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/favicon')) {
          return true
        }
        
        // Check if user is authenticated for protected routes
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        if (pathname.startsWith('/write')) {
          return token?.role === 'ADMIN'
        }
        if (pathname.startsWith('/dashboard')) {
          return token?.role === 'ADMIN'
        }
        if (pathname.startsWith('/profile')) {
          return !!token
        }
        if (pathname.startsWith('/my-posts')) {
          return token?.role === 'ADMIN'
        }
        if (pathname.startsWith('/categories')) {
          return token?.role === 'ADMIN'
        }
        
        // Default to allowing access
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/write/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/my-posts/:path*',
    '/categories/:path*'
  ]
}