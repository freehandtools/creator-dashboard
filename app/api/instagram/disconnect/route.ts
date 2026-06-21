import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    await supabaseAdmin.from('instagram_accounts').delete().eq('user_id', 'local-dev-user')
    await supabaseAdmin.from('instagram_media').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('instagram_media_insights').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('instagram_account_daily_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}