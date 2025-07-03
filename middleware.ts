import { withAuth } from "next-auth/middleware"
import { NextRequest } from "next/server"
import { JWT } from "next-auth/jwt"

export default withAuth(
  function middleware(req: NextRequest) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }: { token: JWT | null; req: NextRequest }) => {
        // Check if user is authenticated for protected routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        if (req.nextUrl.pathname.startsWith('/write')) {
          return token?.role === 'ADMIN'
        }
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return token?.role === 'ADMIN'
        }
        if (req.nextUrl.pathname.startsWith('/profile')) {
          return !!token
        }
        if (req.nextUrl.pathname.startsWith('/my-posts')) {
          return token?.role === 'ADMIN'
        }
        if (req.nextUrl.pathname.startsWith('/categories')) {
          return token?.role === 'ADMIN'
        }
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