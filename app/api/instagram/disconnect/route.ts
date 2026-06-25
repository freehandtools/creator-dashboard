import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const userId = req.cookies.get('session_ig_user_id')?.value
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Ambil account id dulu untuk delete media
    const { data: account } = await supabaseAdmin
      .from('instagram_accounts')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (account) {
      const { data: mediaList } = await supabaseAdmin
        .from('instagram_media')
        .select('media_id')
        .eq('ig_account_id', account.id)

      const mediaIds = (mediaList ?? []).map(m => m.media_id)

      if (mediaIds.length > 0) {
        await supabaseAdmin
          .from('instagram_media_insights')
          .delete()
          .in('media_id', mediaIds)

        await supabaseAdmin
          .from('instagram_media')
          .delete()
          .eq('ig_account_id', account.id)
      }

      await supabaseAdmin
        .from('instagram_account_daily_snapshots')
        .delete()
        .eq('ig_account_id', account.id)

      await supabaseAdmin
        .from('instagram_accounts')
        .delete()
        .eq('user_id', userId)
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.delete('session_ig_user_id')
    return res
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}