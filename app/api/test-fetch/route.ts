import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    hasAppId: !!process.env.META_APP_ID,
    hasAppSecret: !!process.env.META_APP_SECRET,
    hasRedirectUri: !!process.env.META_REDIRECT_URI,
    redirectUriValue: process.env.META_REDIRECT_URI,
  }

  try {
    const body = new URLSearchParams({
      client_id: process.env.META_APP_ID ?? '',
      client_secret: process.env.META_APP_SECRET ?? '',
      redirect_uri: process.env.META_REDIRECT_URI ?? '',
      code: 'dummy_test_code',
    })

    const res = await fetch('https://graph.facebook.com/v20.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    const text = await res.text()
    return NextResponse.json({ ok: true, status: res.status, body: text, envCheck })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      message: err?.message,
      name: err?.name,
      cause: err?.cause ? String(err.cause) : null,
      causeCode: err?.cause?.code ?? null,
      stack: err?.stack,
      envCheck,
    }, { status: 500 })
  }
}