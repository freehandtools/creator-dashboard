import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getLongLivedToken, getIGAccountFromPages, getIGProfile } from '@/lib/meta'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=oauth_denied', req.url))
  }

  try {
    const shortToken = await exchangeCodeForToken(code)
    const longToken = await getLongLivedToken(shortToken)
    const { pageId, pageAccessToken, igUserId } = await getIGAccountFromPages(longToken)
    const profile = await getIGProfile(igUserId, pageAccessToken)

    const { error: dbError } = await supabaseAdmin
      .from('instagram_accounts')
      .upsert(
        {
          user_id: igUserId,
          ig_user_id: igUserId,
          page_id: pageId,
          username: profile.username,
          profile_picture_url: profile.profile_picture_url,
          followers_count: profile.followers_count,
          media_count: profile.media_count,
          access_token: pageAccessToken,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'ig_user_id' }
      )

    if (dbError) throw new Error(dbError.message)

    // Set cookie session
    const res = NextResponse.redirect(new URL('/loading-data', req.url))
    res.cookies.set('session_ig_user_id', igUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 24 * 60 * 60, // 60 hari
      path: '/',
    })
    return res
} catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const cause = err instanceof Error && 'cause' in err ? String((err as any).cause) : 'no-cause'
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(message + ' | ' + cause)}`, req.url)
    )
  }
}