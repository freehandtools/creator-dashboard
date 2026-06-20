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
    // 1. Tukar code → long-lived token
    const shortToken = await exchangeCodeForToken(code)
    const longToken = await getLongLivedToken(shortToken)

    // 2. Cari Instagram Business Account
    const { pageId, pageAccessToken, igUserId } = await getIGAccountFromPages(longToken)

    // 3. Ambil profil IG
    const profile = await getIGProfile(igUserId, pageAccessToken)

    // 4. Simpan ke Supabase
    const { error: dbError } = await supabaseAdmin
      .from('instagram_accounts')
      .upsert(
        {
          user_id: 'local-dev-user',
          ig_user_id: igUserId,
          page_id: pageId,
          username: profile.username,
          profile_picture_url: profile.profile_picture_url,
          followers_count: profile.followers_count,
          media_count: profile.media_count,
          access_token: pageAccessToken,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 hari
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'ig_user_id' }
      )

    if (dbError) throw new Error(dbError.message)

    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('OAuth callback error:', message)
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, req.url))
  }
}