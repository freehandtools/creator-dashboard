// DEPRECATED - BYOT flow: gunakan /api/auth/token/connect
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/auth?notice=byot_required', request.url))
}
