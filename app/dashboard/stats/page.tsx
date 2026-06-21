'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'

type Snapshot = {
  date: string
  followers_count: number | null
  reach: number | null
  profile_views: number | null
  website_clicks: number | null
}

type MediaItem = {
  like_count: number | null
  comments_count: number | null
  timestamp: string | null
  instagram_media_insights: {
    reach: number | null
    saved: number | null
    shares: number | null
    score: number | null
  } | null
}

type DashboardData = {
  account: { followers_count: number | null } | null
  snapshots: Snapshot[]
  media: MediaItem[]
}

type Period = '7' | '30' | '90'

function animateCount(el: HTMLElement, target: number, duration = 1200) {
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    el.textContent = Math.floor(eased * target).toLocaleString()
    if (p < 1) requestAnimationFrame(step)
    else el.textContent = target.toLocaleString()
  }
  requestAnimationFrame(step)
}

function animateChart(
  lineEl: SVGPolylineElement | null,
  areaEl: SVGPolygonElement | null,
  linePts: number[][],
  areaFinal: number[][],
  H: number,
  duration = 1400
) {
  if (!lineEl || !areaEl) return
  const start = performance.now()
  function draw(now: number) {
    const p = Math.min((now - start) / duration, 1)
    const e = 1 - Math.pow(1 - p, 3)
    lineEl.setAttribute('points', linePts.map(([x, y]) => `${x},${(H + (y - H) * e).toFixed(2)}`).join(' '))
    areaEl.setAttribute('points', areaFinal.map(([x, y], i) =>
      i >= linePts.length ? `${x},${y}` : `${x},${(H + (y - H) * e).toFixed(2)}`
    ).join(' '))
    if (p < 1) requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
}

export default function StatsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [data, setData] = useState<DashboardData | null>(null)
  const [period, setPeriod] = useState<Period>('30')
  const [loading, setLoading] = useState(true)

  const metricRefs = useRef<(HTMLSpanElement | null)[]>([])
  const chartsAnimated = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    chartsAnimated.current = false
    try {
      const res = await fetch(`/api/dashboard/data?period=${p}`)
      const json = await res.json()
      setData(json)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData(period) }, [fetchData, period])

  // Animasi count-up metric cards
  useEffect(() => {
    if (loading) return
    metricRefs.current.forEach(el => {
      if (!el) return
      const target = parseInt(el.dataset.target ?? '0', 10)
      animateCount(el, target)
    })
  }, [loading, data])

  // Animasi chart SVG
  useEffect(() => {
    if (loading || chartsAnimated.current || !data) return
    chartsAnimated.current = true

    const snapshots = data.snapshots ?? []
    const media = data.media ?? []
    const H = 60, W = 280

    function buildPts(values: (number | null)[]) {
      const vals = values.map(v => v ?? 0)
      const max = Math.max(...vals, 1)
      return vals.map((v, i) => {
        const x = vals.length > 1 ? (i / (vals.length - 1)) * W : W / 2
        const y = H - (v / max) * (H - 4)
        return [x, y]
      })
    }

    const chartDefs: { lineId: string; areaId: string; values: (number | null)[] }[] = [
      { lineId: 'line-reach', areaId: 'area-reach', values: snapshots.map(s => s.reach) },
      { lineId: 'line-followers', areaId: 'area-followers', values: snapshots.map(s => s.followers_count) },
      { lineId: 'line-profile', areaId: 'area-profile', values: snapshots.map(s => s.profile_views) },
      { lineId: 'line-score', areaId: 'area-score', values: media.map(m => m.instagram_media_insights?.score ?? null) },
    ]

    chartDefs.forEach(({ lineId, areaId, values }) => {
      const lineEl = document.getElementById(lineId) as SVGPolylineElement | null
      const areaEl = document.getElementById(areaId) as SVGPolygonElement | null
      if (!lineEl || !areaEl || values.every(v => !v)) return
      const pts = buildPts(values)
      if (pts.length === 1) pts.push([W, pts[0][1]])
      const areaFinal = [...pts, [W, H], [0, H]]
      animateChart(lineEl, areaEl, pts, areaFinal, H)
    })
  }, [loading, data])

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
  const chipBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.12)'
  const chipColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,10,20,0.5)'
  const chipActiveBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.08)'
  const chipActiveBorder = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,20,0.2)'

  const snapshots = data?.snapshots ?? []
  const media = data?.media ?? []
  const followers = data?.account?.followers_count ?? null

  const totalLikes = media.reduce((s, m) => s + (m.like_count ?? 0), 0)
  const totalComments = media.reduce((s, m) => s + (m.comments_count ?? 0), 0)
  const totalSaves = media.reduce((s, m) => s + (m.instagram_media_insights?.saved ?? 0), 0)
  const totalReach = media.reduce((s, m) => s + (m.instagram_media_insights?.reach ?? 0), 0)
  const avgScore = media.length > 0
    ? Math.round(media.reduce((s, m) => s + (m.instagram_media_insights?.score ?? 0), 0) / media.length)
    : 0
  const avgLikes = media.length > 0 ? Math.round(totalLikes / media.length) : 0

  const half = Math.floor(media.length / 2)
  const recentMedia = media.slice(0, half || media.length)
  const olderMedia = media.slice(half)
  const recentLikes = recentMedia.reduce((s, m) => s + (m.like_count ?? 0), 0)
  const olderLikes = olderMedia.reduce((s, m) => s + (m.like_count ?? 0), 0)
  const recentComments = recentMedia.reduce((s, m) => s + (m.comments_count ?? 0), 0)
  const olderComments = olderMedia.reduce((s, m) => s + (m.comments_count ?? 0), 0)

  function pctChange(recent: number, older: number) {
    if (older === 0) return null
    return Math.round(((recent - older) / older) * 100)
  }
  const likesPct = pctChange(recentLikes, olderLikes)
  const commentsPct = pctChange(recentComments, olderComments)

  const statCards = [
    { label: 'Total Likes', value: totalLikes },
    { label: 'Total Komentar', value: totalComments },
    { label: 'Total Saves', value: totalSaves },
    { label: 'Total Reach', value: totalReach },
    { label: 'Followers', value: followers ?? 0 },
    { label: 'Rata-rata Skor', value: avgScore },
    { label: 'Jumlah Konten', value: media.length },
    { label: 'Avg. Likes/Konten', value: avgLikes },
  ]

  const SIDEBAR_ITEMS = [
    { icon: 'ti-layout-dashboard', href: '/dashboard' },
    { icon: 'ti-photo', href: '/dashboard/content' },
    { icon: 'ti-chart-bar', href: '/dashboard/stats', active: true },
    { icon: 'ti-users', href: '/dashboard/audience' },
    { icon: 'ti-bulb', href: '/dashboard/ai' },
  ]

  function MiniChartEmpty() {
    return (
      <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: textTertiary, fontStyle: 'italic' }}>Belum ada data</span>
      </div>
    )
  }

  function MiniChart({ lineId, areaId, color, values }: { lineId: string; areaId: string; color: string; values: (number | null)[] }) {
    const hasData = values.some(v => v !== null && v > 0)
    if (!hasData) return <MiniChartEmpty />
    const H = 60, W = 280
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${lineId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={isDark ? '0.25' : '0.15'} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon id={areaId} points={`0,${H} ${W},${H} ${W},${H} 0,${H}`} fill={`url(#grad-${lineId})`} />
        <polyline id={lineId} points={`0,${H} ${W},${H}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  function DeltaBadge({ pct }: { pct: number | null }) {
    if (pct === null) return <span style={{ fontSize: 10, color: textTertiary }}>—</span>
    return (
      <span style={{ fontSize: 10, color: pct >= 0 ? '#4ade80' : '#f87171' }}>
        {pct >= 0 ? '↑' : '↓'} {Math.abs(pct)}%
      </span>
    )
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes igShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer { 0%{opacity:0.4} 50%{opacity:0.8} 100%{opacity:0.4} }
      `}</style>

      {/* NAVBAR */}
      <div style={{ padding: '10px 12px 0', flexShrink: 0 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderRadius: 12, border: `0.5px solid ${navBorder}`, backdropFilter: 'blur(16px)', background: navBg }}>
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
          <span style={{ fontSize: 18, fontWeight: 900, color: textPrimary }}>Statistik & Tren</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['7', '30', '90'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ fontSize: 11, padding: '5px 11px', borderRadius: 7, border: `0.5px solid ${period === p ? chipActiveBorder : chipBorder}`, color: period === p ? textPrimary : chipColor, background: period === p ? chipActiveBg : 'transparent', cursor: 'pointer' }}>
                {p} hari
              </button>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {/* SIDEBAR */}
          <div style={{ width: 60, borderRight: `0.5px solid ${sidebarBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 6, flexShrink: 0 }}>
            {SIDEBAR_ITEMS.map((item, i) => (
              <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: item.active ? '#fff' : sIconColor, background: item.active ? 'linear-gradient(135deg,#FF7A00,#FF0069,#7638FA)' : 'transparent', cursor: 'pointer' }}>
                  <i className={`ti ${item.icon}`} />
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
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[80, 80, 200, 120].map((h, i) => (
                  <div key={i} style={{ height: h, borderRadius: 12, background: cardBg, animation: 'shimmer 1.5s ease infinite' }} />
                ))}
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                  {statCards.map((card, i) => (
                    <div key={i} style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 11, color: textTertiary, marginBottom: 4 }}>{card.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: textPrimary }}>
                        <span ref={el => { metricRefs.current[i] = el }} data-target={card.value}>0</span>
                        {card.label === 'Rata-rata Skor' && <span style={{ fontSize: 13, fontWeight: 400, color: textTertiary }}>/100</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { title: 'Reach harian', lineId: 'line-reach', areaId: 'area-reach', color: '#FF0069', values: snapshots.map(s => s.reach) },
                    { title: 'Pertumbuhan Followers', lineId: 'line-followers', areaId: 'area-followers', color: '#FFD600', values: snapshots.map(s => s.followers_count) },
                    { title: 'Profile Views harian', lineId: 'line-profile', areaId: 'area-profile', color: '#7638FA', values: snapshots.map(s => s.profile_views) },
                    { title: 'Skor per konten', lineId: 'line-score', areaId: 'area-score', color: '#D300C5', values: media.map(m => m.instagram_media_insights?.score ?? null) },
                  ].map(chart => (
                    <div key={chart.lineId} style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 11, color: textTertiary, marginBottom: 8 }}>{chart.title}</div>
                      <MiniChart {...chart} />
                    </div>
                  ))}
                </div>

                {/* Perbandingan periode */}
                <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: textTertiary, marginBottom: 12 }}>Perbandingan konten terbaru vs sebelumnya</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {[
                      { label: 'Likes', value: recentLikes, pct: likesPct },
                      { label: 'Komentar', value: recentComments, pct: commentsPct },
                      { label: 'Followers', value: followers ?? 0, pct: null },
                      { label: 'Konten', value: media.length, pct: null },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 11, color: textTertiary, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary }}>
                          <span ref={el => { metricRefs.current[statCards.length + i] = el }} data-target={item.value}>0</span>
                        </div>
                        <DeltaBadge pct={item.pct} />
                      </div>
                    ))}
                  </div>
                  {media.length < 2 && (
                    <div style={{ fontSize: 11, color: textTertiary, fontStyle: 'italic', marginTop: 10 }}>
                      Perbandingan lebih akurat setelah konten bertambah.
                    </div>
                  )}
                </div>

                {snapshots.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 11, color: textTertiary, fontStyle: 'italic' }}>
                    Grafik harian akan terisi seiring waktu — data terkumpul setiap kali refresh dilakukan.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
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