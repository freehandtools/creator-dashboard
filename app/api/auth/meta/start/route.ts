import { NextResponse } from 'next/server'

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement',
    response_type: 'code',
  })

  const url = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`
  return NextResponse.redirect(url)
}