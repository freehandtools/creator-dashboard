import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session_ig_user_id')?.value
  const { pathname } = request.nextUrl

  const protectedPaths = ['/dashboard', '/loading-data']
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (pathname === '/auth' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/loading-data', '/auth'],
}
