'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type MediaDetail = {
  id: string
  media_id: string
  caption: string | null
  media_type: string
  media_url: string | null
  thumbnail_url: string | null
  permalink: string | null
  timestamp: string | null
  like_count: number | null
  comments_count: number | null
  instagram_media_insights: {
    reach: number | null
    impressions: number | null
    saved: number | null
    shares: number | null
    views: number | null
    score: number | null
  } | null
}

export default function ContentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const mediaId = params.id as string

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [item, setItem] = useState<MediaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({})
  const [scoreWidth, setScoreWidth] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/data')
      const json = await res.json()
      const found = (json.media || []).find((m: MediaDetail) => m.media_id === mediaId)
      if (found) setItem(found)
      else setNotFound(true)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [mediaId])

  useEffect(() => { fetchData() }, [fetchData])

  // Animasi count-up setelah data loaded
  useEffect(() => {
    if (!item) return
    const ins = item.instagram_media_insights
    const targets: Record<string, number> = {
      views: ins?.views ?? 0,
      reach: ins?.reach ?? 0,
      impressions: ins?.impressions ?? 0,
      likes: item.like_count ?? 0,
      comments: item.comments_count ?? 0,
      saves: ins?.saved ?? 0,
      shares: ins?.shares ?? 0,
    }
    const finalScore = ins?.score ?? 0
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const result: Record<string, number> = {}
      Object.entries(targets).forEach(([k, v]) => {
        result[k] = Math.floor(v * eased)
      })
      setAnimatedValues(result)
      setScoreWidth(finalScore * eased)
      if (progress < 1) requestAnimationFrame(tick)
      else {
        setAnimatedValues(targets)
        setScoreWidth(finalScore)
      }
    }
    requestAnimationFrame(tick)
  }, [item])

  const isDark = theme === 'dark'
  const bg = isDark ? '#08080f' : '#f7f7fa'
  const navBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'
  const navBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.15)'
  const topbarBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.07)'
  const textPrimary = isDark ? '#fff' : '#0a0a14'
  const textSecondary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,20,0.5)'
  const textTertiary = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(10,10,20,0.35)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,20,0.03)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.08)'
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.07)'
  const toggleBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.06)'
  const sIconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.4)'
  const thumbBg = isDark ? 'linear-gradient(135deg,#2a1a3a,#1a1430)' : 'linear-gradient(135deg,#e8e0f0,#d0c8e8)'
  const thumbColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,20,0.15)'
  const dashedBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,20,0.15)'
  const aiLabelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,20,0.45)'
  const aiExplainColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,20,0.35)'
  const aiItemBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,20,0.06)'

  const ins = item?.instagram_media_insights
  const score = ins?.score ?? null

  function formatDate(ts: string | null) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function typeLabel(t: string) {
    if (t === 'CAROUSEL_ALBUM') return 'CAROUSEL'
    if (t === 'IMAGE') return 'FOTO'
    if (t === 'VIDEO') return 'VIDEO'
    return t
  }

  const SIDEBAR_ITEMS = [
    { icon: 'ti-layout-dashboard', href: '/dashboard' },
    { icon: 'ti-photo', href: '/dashboard/content', active: true },
    { icon: 'ti-chart-bar', href: '/dashboard/stats' },
    { icon: 'ti-users', href: '/dashboard/audience' },
    { icon: 'ti-bulb', href: '/dashboard/ai' },
  ]

  const METRIC_CARDS = [
    { label: 'Views', key: 'views', raw: ins?.views },
    { label: 'Reach', key: 'reach', raw: ins?.reach },
    { label: 'Impressions', key: 'impressions', raw: ins?.impressions },
    { label: 'Likes', key: 'likes', raw: item?.like_count },
    { label: 'Komentar', key: 'comments', raw: item?.comments_count },
    { label: 'Saves', key: 'saves', raw: ins?.saved },
    { label: 'Shares', key: 'shares', raw: ins?.shares },
  ]

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes igShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer { 0%{opacity:0.4} 50%{opacity:0.8} 100%{opacity:0.4} }
      `}</style>

      {/* NAVBAR */}
      <div style={{ padding: '10px 12px 0', flexShrink: 0 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderRadius: 12, border: `0.5px solid ${navBorder}`, backdropFilter: 'blur(16px)', background: navBg, transition: 'all 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <FreehandLogo color={textPrimary} />
            <span style={{ fontSize: 12, fontWeight: 500, color: textPrimary }}>freehandtools</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, background: cardBg, border: `0.5px solid ${navBorder}`, borderRadius: 8, padding: '0 14px', fontSize: 11, color: textPrimary, cursor: 'pointer' }}>
              <i className="ti ti-message" style={{ fontSize: 13 }} />Hubungi Kami
            </button>
            <button onClick={toggleTheme} style={{ width: 32, height: 32, borderRadius: 8, border: `0.5px solid ${navBorder}`, background: toggleBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: textPrimary, fontSize: 16 }}>
              <i className={`ti ${isDark ? 'ti-moon' : 'ti-sun'}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* APP SHELL */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* TOPBAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `0.5px solid ${topbarBorder}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.push('/dashboard/content')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textTertiary, fontSize: 18, display: 'flex', alignItems: 'center', padding: 0 }}>
              <i className="ti ti-arrow-left" />
            </button>
            <span style={{ fontSize: 18, fontWeight: 900, color: textPrimary }}>Detail Konten</span>
          </div>
          {item?.permalink && (
            <a href={item.permalink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: 'none', background: 'linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA)', backgroundSize: '200% 100%', animation: 'igShift 4s ease infinite', color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
              <i className="ti ti-external-link" style={{ fontSize: 13 }} />
              Buka di Instagram
            </a>
          )}
        </div>

        {/* BODY */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {/* SIDEBAR */}
          <div style={{ width: 60, borderRight: `0.5px solid ${sidebarBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 6, flexShrink: 0 }}>
            {SIDEBAR_ITEMS.map((it, i) => (
              <Link key={i} href={it.href} style={{ textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: it.active ? '#fff' : sIconColor, background: it.active ? 'linear-gradient(135deg,#FF7A00,#FF0069,#7638FA)' : 'transparent', cursor: 'pointer' }}>
                  <i className={`ti ${it.icon}`} />
                </div>
              </Link>
            ))}
            <Link href="/dashboard/settings" style={{ textDecoration: 'none', marginTop: 'auto' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: sIconColor }}>
                <i className="ti ti-settings" />
              </div>
            </Link>
          </div>

          {/* MAIN SCROLL */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>

            {loading && (
              <div style={{ display: 'flex', gap: 18 }}>
                <div style={{ width: 200, height: 260, borderRadius: 12, background: cardBg, animation: 'shimmer 1.5s ease infinite', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[80, 40, 120].map((h, i) => <div key={i} style={{ height: h, borderRadius: 8, background: cardBg, animation: 'shimmer 1.5s ease infinite' }} />)}
                </div>
              </div>
            )}

            {!loading && notFound && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: textTertiary }}>
                <i className="ti ti-photo-off" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                <div style={{ fontSize: 13 }}>Konten tidak ditemukan</div>
                <button onClick={() => router.push('/dashboard/content')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 20, border: `0.5px solid ${cardBorder}`, background: cardBg, color: textPrimary, fontSize: 12, cursor: 'pointer' }}>
                  Kembali ke Konten
                </button>
              </div>
            )}

            {!loading && item && (
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {/* Thumbnail */}
                <div style={{ width: 200, flexShrink: 0 }}>
                  <div style={{ width: 200, height: 260, borderRadius: 12, background: thumbBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: thumbColor, fontSize: 32, overflow: 'hidden' }}>
                    {item.thumbnail_url || item.media_url
                      ? <img src={item.thumbnail_url || item.media_url || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      : <i className="ti ti-photo" />
                    }
                  </div>
                  {item.permalink && (
                    <a href={item.permalink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 10, fontSize: 11, color: textTertiary, textDecoration: 'none' }}>
                      <i className="ti ti-external-link" style={{ fontSize: 12 }} />
                      Lihat di Instagram
                    </a>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontSize: 11, color: textTertiary, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, background: cardBg, border: `0.5px solid ${cardBorder}`, color: textSecondary, marginRight: 8 }}>
                      {typeLabel(item.media_type)}
                    </span>
                    {formatDate(item.timestamp)}
                  </div>

                  <div style={{ fontSize: 13, color: textPrimary, lineHeight: 1.6, marginBottom: 18, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item.caption || <span style={{ color: textTertiary, fontStyle: 'italic' }}>(tanpa caption)</span>}
                  </div>

                  {/* Metric cards dengan animasi */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                    {METRIC_CARDS.map(m => (
                      <div key={m.label} style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: textTertiary, marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: m.raw != null ? textPrimary : textTertiary }}>
                          {m.raw != null ? (animatedValues[m.key] ?? 0) : '—'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Score bar dengan animasi */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: textTertiary, marginBottom: 6 }}>Skor konten</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 8, background: cardBg, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: 8, borderRadius: 4,
                          width: `${scoreWidth}%`,
                          background: score !== null ? 'linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA)' : 'transparent',
                          backgroundSize: '200% 100%',
                          animation: score !== null ? 'igShift 4s ease infinite' : undefined,
                        }} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary, whiteSpace: 'nowrap' }}>
                        {score !== null ? `${Math.round(scoreWidth)}/100` : '—'}
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div style={{ background: cardBg, border: `0.5px dashed ${dashedBorder}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: aiLabelColor, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="ti ti-sparkles" style={{ fontSize: 13 }} />
                      AI Analisis
                    </div>
                    {score === null ? (
                      <div style={{ fontSize: 12, color: textTertiary, fontStyle: 'italic' }}>Data insight belum tersedia untuk konten ini.</div>
                    ) : score >= 70 ? (
                      <>
                        <AIItem title="Performa di atas rata-rata" explain="Skor konten ini termasuk tinggi dibanding konten lainnya." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} />
                        <AIItem title="Caption efektif mendorong engagement" explain="Likes dan komentar menunjukkan respons positif dari audiens." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} />
                        <AIItem title="Pertahankan format & waktu posting" explain="Konsistensi adalah kunci pertumbuhan organik di Instagram." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} last />
                      </>
                    ) : score >= 40 ? (
                      <>
                        <AIItem title="Performa rata-rata" explain="Ada ruang untuk meningkatkan engagement di konten berikutnya." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} />
                        <AIItem title="Coba tambahkan CTA di caption" explain="Pertanyaan atau ajakan komentar biasanya meningkatkan interaksi." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} />
                        <AIItem title="Hashtag niche bisa memperluas reach" explain="Tanpa hashtag, konten hanya terlihat oleh follower yang ada." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} last />
                      </>
                    ) : (
                      <>
                        <AIItem title="Performa di bawah rata-rata" explain="Konten ini belum mendapat banyak respons dari audiens." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} />
                        <AIItem title="Pertimbangkan ulang waktu posting" explain="Coba posting di jam aktif audiens (pagi atau malam hari)." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} />
                        <AIItem title="Caption terlalu singkat atau tidak ada CTA" explain="Caption tanpa hook atau pertanyaan cenderung diabaikan." border={aiItemBorder} color={textPrimary} explainColor={aiExplainColor} last />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AIItem({ title, explain, border, color, explainColor, last }: {
  title: string; explain: string; border: string; color: string; explainColor: string; last?: boolean
}) {
  return (
    <div style={{ fontSize: 12, color, padding: '8px 0', borderBottom: last ? 'none' : `0.5px solid ${border}`, lineHeight: 1.5 }}>
      ✦ {title}
      <div style={{ fontSize: 11, color: explainColor, marginTop: 3 }}>{explain}</div>
    </div>
  )
}

function FreehandLogo({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 500 420" fill={color} style={{ transition: 'fill 0.3s' }}>
      <path d="M209.73,104.87c0,11.58-9.39,20.97-20.97,20.97h-62.92v62.92c0,11.58-9.39,20.97-20.97,20.97-11.58,0-20.97-9.39-20.97-20.97v-62.92H20.97C9.39,125.84,0,116.45,0,104.87c0-11.58,9.39-20.97,20.97-20.97h62.92V20.97C83.89,9.39,93.28,0,104.86,0c11.58,0,20.97,9.39,20.97,20.97v62.93h62.92c11.58,0,20.97,9.39,20.97,20.97Z"/>
      <path d="M440.43,356.53v10.5c0,5.79-4.69,10.48-10.48,10.48-5.79,0-10.48-4.69-10.48-10.48-0-5.79-4.7-10.49-10.49-10.49-5.79,0-10.49,4.7-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-10.49c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-31.46c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v41.94c0,28.96-23.48,52.43-52.43,52.43-28.96,0-52.43-23.48-52.43-52.43v-136.32c0-11.58,9.39-20.97,20.97-20.97,11.58,0,20.97,9.39,20.97,20.97v136.32c0,5.79,4.69,10.48,10.48,10.48,5.79,0,10.48-4.69,10.48-10.48v-52.43c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94v31.46c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.95,41.95-41.95,23.17,0,41.95,18.78,41.95,41.95v10.49c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94Z"/>
    </svg>
  )
}