import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('instagram_accounts')
      .select('id')
      .limit(1)
    return NextResponse.json({ ok: true, data, error })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      message: err?.message,
      name: err?.name,
      cause: err?.cause ? String(err.cause) : null,
      stack: err?.stack,
    }, { status: 500 })
  }
}