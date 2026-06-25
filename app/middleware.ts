import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const session = req.cookies.get('session_ig_user_id')?.value
  const { pathname } = req.nextUrl

  // Protect semua /dashboard/* dan /loading-data
  const protectedPaths = ['/dashboard', '/loading-data']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Kalau sudah login dan buka /auth, redirect ke dashboard
  if (pathname === '/auth' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/loading-data', '/auth'],
}