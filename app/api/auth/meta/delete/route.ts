import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verifikasi signed_request dari Meta
function parseSignedRequest(signedRequest: string, appSecret: string): Record<string, unknown> | null {
  try {
    const [encodedSig, payload] = signedRequest.split('.')
    const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))

    const expectedSig = crypto.createHmac('sha256', appSecret).update(payload).digest()
    if (!crypto.timingSafeEqual(sig, expectedSig)) return null

    return data
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? ''
    let signedRequest: string | null = null

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text()
      const params = new URLSearchParams(text)
      signedRequest = params.get('signed_request')
    } else {
      const body = await req.json().catch(() => ({}))
      signedRequest = body.signed_request ?? null
    }

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
    }

    const appSecret = process.env.META_APP_SECRET
    if (!appSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const data = parseSignedRequest(signedRequest, appSecret)
    if (!data) {
      return NextResponse.json({ error: 'Invalid signed_request' }, { status: 400 })
    }

    const userId = data.user_id as string | undefined
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id in signed_request' }, { status: 400 })
    }

    // Cari akun berdasarkan Meta user_id
    // Meta user_id di sini adalah Facebook user ID — kita match ke ig_user_id atau page_id
    // Strategy: hapus berdasarkan ig_user_id (yang paling relevan untuk deletion)
    const { data: accounts } = await supabase
      .from('instagram_accounts')
      .select('id, ig_user_id')
      .or(`ig_user_id.eq.${userId},page_id.eq.${userId}`)

    if (accounts && accounts.length > 0) {
      for (const account of accounts) {
        const igAccountId = account.id

        // Hapus child tables dulu (foreign key order)
        await supabase
          .from('instagram_media_insights')
          .delete()
          .in(
            'media_id',
            (await supabase
              .from('instagram_media')
              .select('media_id')
              .eq('ig_account_id', igAccountId)).data?.map((m) => m.media_id) ?? []
          )

        await supabase
          .from('instagram_media')
          .delete()
          .eq('ig_account_id', igAccountId)

        await supabase
          .from('instagram_account_daily_snapshots')
          .delete()
          .eq('ig_account_id', igAccountId)

        await supabase
          .from('instagram_accounts')
          .delete()
          .eq('id', igAccountId)
      }
    }

    // Meta butuh response dengan confirmation_code dan status_url
    const confirmationCode = crypto.randomBytes(16).toString('hex')
    const statusUrl = `${process.env.META_REDIRECT_URI?.replace('/api/auth/meta/callback', '')}/api/auth/meta/delete/status?code=${confirmationCode}`

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    })
  } catch (err) {
    console.error('[delete/route] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint untuk status URL (Meta akan check ini)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ status: 'invalid' }, { status: 400 })
  }

  // Kita tidak track status per-request secara persistent,
  // jadi return "complete" — penghapusan sudah dilakukan saat POST
  return NextResponse.json({
    status: 'complete',
    confirmation_code: code,
    message: 'Data deletion has been processed.',
  })
}
