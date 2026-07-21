import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('session_ig_user_id')?.value
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const periodParam = searchParams.get('period')

  const { data: account } = await supabaseAdmin
    .from('instagram_accounts')
    .select('username, name, followers_count, media_count, profile_picture_url, updated_at')
    .eq('user_id', userId)
    .single()

  const { data: accountFull } = await supabaseAdmin
    .from('instagram_accounts')
    .select('id')
    .eq('user_id', userId)
    .single()

  let mediaQuery = supabaseAdmin
    .from('instagram_media')
    .select('media_id, caption, media_type, media_url, thumbnail_url, permalink, timestamp, like_count, comments_count')
    .eq('ig_account_id', accountFull?.id)

  if (periodParam) {
    const period = parseInt(periodParam, 10)
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()
    mediaQuery = mediaQuery.gte('timestamp', since)
  }

  const { data: media } = await mediaQuery
    .order('timestamp', { ascending: false })
    .limit(50)

  if (!media || media.length === 0) {
    return NextResponse.json({ account: account ?? null, media: [] })
  }

  const mediaIds = media.map(m => m.media_id)
  const { data: insights } = await supabaseAdmin
    .from('instagram_media_insights')
    .select('media_id, reach, saved, shares, engagement, score')
    .in('media_id', mediaIds)

  const insightMap = Object.fromEntries((insights ?? []).map(i => [i.media_id, i]))
  const merged = media.map(m => ({
    ...m,
    instagram_media_insights: insightMap[m.media_id] ?? null
  }))

  return NextResponse.json({ account: account ?? null, media: merged })
}