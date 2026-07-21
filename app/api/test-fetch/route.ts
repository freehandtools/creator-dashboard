import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://graph.facebook.com/v20.0/me')
    const text = await res.text()
    return NextResponse.json({ ok: true, status: res.status, body: text })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      message: err?.message,
      name: err?.name,
      cause: err?.cause ? String(err.cause) : null,
      causeCode: err?.cause?.code ?? null,
      stack: err?.stack,
    }, { status: 500 })
  }
}