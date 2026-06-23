import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // 1. Ambil akun
    const { data: account, error: accErr } = await supabaseAdmin
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', 'local-dev-user')
      .single()

    if (accErr || !account) {
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 })
    }

    // 2. Ambil media
    const { data: mediaList } = await supabaseAdmin
      .from('instagram_media')
      .select('*')
      .eq('ig_account_id', account.id)
      .order('timestamp', { ascending: false })
      .limit(20)

    // 3. Ambil insights
    const mediaIds = (mediaList ?? []).map((m) => m.media_id)
    const { data: insightsList } = await supabaseAdmin
      .from('instagram_media_insights')
      .select('*')
      .in('media_id', mediaIds)

    const insightMap: Record<string, Record<string, unknown>> = {}
    for (const ins of insightsList ?? []) {
      insightMap[ins.media_id] = ins
    }

    // 4. Gabungkan
    const enrichedMedia = (mediaList ?? []).map((m) => ({
      caption: m.caption?.slice(0, 100) ?? '',
      media_type: m.media_type,
      timestamp: m.timestamp,
      like_count: m.like_count,
      comments_count: m.comments_count,
      reach: insightMap[m.media_id]?.reach ?? null,
      saved: insightMap[m.media_id]?.saved ?? null,
      shares: insightMap[m.media_id]?.shares ?? null,
      score: insightMap[m.media_id]?.score ?? null,
      engagement: insightMap[m.media_id]?.engagement ?? null,
    }))

    // 5. Buat prompt
    const prompt = `
Kamu adalah analis konten Instagram profesional untuk akun @${account.username} (${account.name ?? ''}).
Data akun:
- Followers: ${account.followers_count}
- Total post: ${account.media_count}

Data konten terbaru (JSON):
${JSON.stringify(enrichedMedia, null, 2)}

Hasilkan analisis dalam format JSON SAJA (tanpa markdown, tanpa penjelasan tambahan):
{
  "kekuatan": [
    { "judul": "...", "penjelasan": "..." },
    { "judul": "...", "penjelasan": "..." },
    { "judul": "...", "penjelasan": "..." }
  ],
  "blind_spot": [
    { "judul": "...", "penjelasan": "..." },
    { "judul": "...", "penjelasan": "..." },
    { "judul": "...", "penjelasan": "..." }
  ],
  "peluang": [
    { "judul": "...", "penjelasan": "..." },
    { "judul": "...", "penjelasan": "..." },
    { "judul": "...", "penjelasan": "..." }
  ],
  "ide_konten": [
    "ide 1",
    "ide 2",
    "ide 3",
    "ide 4",
    "ide 5",
    "ide 6",
    "ide 7",
    "ide 8",
    "ide 9",
    "ide 10"
  ]
}

Gunakan Bahasa Indonesia. Berdasarkan data nyata di atas, bukan contoh generik. Gunakan angka/fakta dari data jika ada.`

    // 6. Panggil Gemini
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    )

    const geminiData = await geminiRes.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // 7. Parse JSON dari Gemini (strip markdown fence jika ada)
    const clean = rawText.replace(/```json|```/g, '').trim()
    let safeJson = clean
    if (!safeJson.endsWith('}')) {
      const lastBrace = safeJson.lastIndexOf('}')
      safeJson = lastBrace > -1 ? safeJson.slice(0, lastBrace + 1) : safeJson
    }
    const parsed = JSON.parse(safeJson)

    return NextResponse.json({ success: true, data: parsed, username: account.username })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}