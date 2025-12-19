import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'session_azteka'

// Check if pathname is a public route
function isPublicRoute(pathname: string): boolean {
  // Allow all admin routes - AuthGuard handles actual auth
  if (pathname.startsWith('/admin')) {
    return true
  }

  // Allow all API routes - API handlers do their own auth
  if (pathname.startsWith('/api/')) {
    return true
  }

  // Allow /auth/* routes
  if (pathname.startsWith('/auth/')) {
    return true
  }

  // Allow /login route
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return true
  }

  // Allow /catalog route
  if (pathname === '/catalog' || pathname.startsWith('/catalog/')) {
    return true
  }

  // Allow /grocery route (public grocery store UI)
  if (pathname === '/grocery' || pathname.startsWith('/grocery/')) {
    return true
  }

  // Allow /demo route
  if (pathname === '/demo' || pathname.startsWith('/demo/')) {
    return true
  }

  // Allow /kiosk route (public employee time clock)
  if (pathname === '/kiosk' || pathname.startsWith('/kiosk/')) {
    return true
  }

  // Allow /employee route - AuthGuard handles actual role-based auth
  if (pathname === '/employee' || pathname.startsWith('/employee/')) {
    return true
  }

  // Allow public assets (_next, static files, etc.)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/uploads/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return true
  }

  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // For protected routes, just check if cookie exists
  // Real validation happens in AuthGuard component or API route handlers
  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (!token) {
    // No session - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Cookie exists - allow request, let AuthGuard validate
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
}
