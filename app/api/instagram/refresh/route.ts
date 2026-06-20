import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BASE = 'https://graph.facebook.com/v20.0'

export async function GET() {
  try {
    // 1. Ambil akun dari Supabase
    const { data: account, error: accErr } = await supabaseAdmin
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', 'local-dev-user')
      .single()

    if (accErr || !account) {
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 })
    }

    const { ig_user_id, access_token, id: igAccountId } = account

    // 2. Fetch profil IG
    const profileRes = await fetch(
      `${BASE}/${ig_user_id}?fields=id,username,name,followers_count,media_count,profile_picture_url&access_token=${access_token}`
    )
    const profile = await profileRes.json()
    if (profile.error) throw new Error(`Profile: ${profile.error.message}`)

    await supabaseAdmin
      .from('instagram_accounts')
      .update({
        username: profile.username,
        name: profile.name,
        followers_count: profile.followers_count,
        media_count: profile.media_count,
        profile_picture_url: profile.profile_picture_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', igAccountId)

    // 3. Fetch media list
    const mediaRes = await fetch(
      `${BASE}/${ig_user_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${access_token}`
    )
    const mediaData = await mediaRes.json()
    if (mediaData.error) throw new Error(`Media: ${mediaData.error.message}`)

    const mediaList = mediaData.data ?? []
    let savedCount = 0
    let insightCount = 0

    for (const item of mediaList) {
      // Upsert ke instagram_media
      const { error: mediaErr } = await supabaseAdmin
        .from('instagram_media')
        .upsert({
          ig_account_id: igAccountId,
          media_id: item.id,
          caption: item.caption ?? null,
          media_type: item.media_type,
          media_url: item.media_url ?? null,
          thumbnail_url: item.thumbnail_url ?? null,
          permalink: item.permalink,
          timestamp: item.timestamp,
          like_count: item.like_count ?? 0,
          comments_count: item.comments_count ?? 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'media_id' })

      if (!mediaErr) savedCount++

      // 4. Fetch insights per media
      // CAROUSEL_ALBUM tidak support semua metric — tangani gracefully
      const insightMetrics =
        item.media_type === 'VIDEO'
          ? 'reach,saved,shares,views'
          : 'reach,saved,shares'

      let reach = null, saved = null, shares = null, views = null

      try {
        const insRes = await fetch(
          `${BASE}/${item.id}/insights?metric=${insightMetrics}&access_token=${access_token}`
        )
        const insData = await insRes.json()

        if (!insData.error && insData.data) {
          for (const m of insData.data) {
            const val = m.values?.[0]?.value ?? null
            if (m.name === 'reach') reach = val
            if (m.name === 'saved') saved = val
            if (m.name === 'shares') shares = val
            if (m.name === 'views') views = val
          }
        }
      } catch {
        // Insight gagal → lanjut, simpan null
      }

      // 5. Hitung score
      const likes = item.like_count ?? 0
      const comments = item.comments_count ?? 0
      const savedVal = saved ?? 0
      const reachVal = reach ?? 0
      const score = likes * 1 + comments * 3 + savedVal * 10 + reachVal * 0.05

      const engagementRate =
        reachVal > 0
          ? ((likes + comments + savedVal) / reachVal) * 100
          : profile.followers_count > 0
          ? ((likes + comments) / profile.followers_count) * 100
          : 0

      await supabaseAdmin
        .from('instagram_media_insights')
        .upsert({
          media_id: item.id,
          reach,
          saved,
          shares,
          engagement: Math.round(engagementRate * 100) / 100,
          views,
          score: Math.round(score * 100) / 100,
          fetched_at: new Date().toISOString(),
        }, { onConflict: 'media_id' })

      insightCount++
    }

    return NextResponse.json({
      success: true,
      username: profile.username,
      followers: profile.followers_count,
      media_fetched: savedCount,
      insights_fetched: insightCount,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}