'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type Period = 7 | 30 | 90

interface Account {
  username: string
  name: string | null
  followers_count: number
  media_count: number
  profile_picture_url: string | null
  updated_at: string
}

interface MediaRow {
  media_id: string
  caption: string | null
  media_type: string
  media_url: string | null
  thumbnail_url: string | null
  permalink: string
  timestamp: string
  like_count: number
  comments_count: number
  instagram_media_insights: {
    reach: number | null
    saved: number | null
    shares: number | null
    engagement: number | null
    score: number | null
  } | null
}

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

export default function DashboardPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [period, setPeriod] = useState<Period>(30)
  const [account, setAccount] = useState<Account | null>(null)
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null)
  const metricsRef = useRef<(HTMLSpanElement | null)[]>([])
  const scoreBarRefs = useRef<(HTMLDivElement | null)[]>([])
  const chartAnimated = useRef(false)

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    chartAnimated.current = false
    const res = await fetch(`/api/dashboard/data?period=${p}`)
    const json = await res.json()
    setAccount(json.account)
    setMedia(json.media ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData(period) }, [fetchData, period])

  useEffect(() => {
    if (loading) return
    metricsRef.current.forEach(el => {
      if (!el) return
      const target = parseInt(el.dataset.target ?? '0', 10)
      animateCount(el, target)
    })
    setTimeout(() => {
      scoreBarRefs.current.forEach(el => {
        if (!el) return
        el.style.transform = `scaleX(${parseFloat(el.dataset.width ?? '0') / 100})`
      })
    }, 50)
  }, [loading, media])

  useEffect(() => {
    if (loading || chartAnimated.current || media.length === 0) return
    chartAnimated.current = true
    const areaPoly = document.getElementById('areaPoly')
    const linePoly = document.getElementById('linePoly')
    if (!areaPoly || !linePoly) return
    const reachPoints = [...media]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(m => m.instagram_media_insights?.reach ?? 0)
    const maxR = Math.max(...reachPoints, 1)
    const H = 56, W = 600
    const step = reachPoints.length > 1 ? W / (reachPoints.length - 1) : W
    const linePts = reachPoints.map((r, i) => [i * step, H - (r / maxR) * (H - 6) - 6])
    if (linePts.length === 1) linePts.push([W, linePts[0][1]])
    const areaFinal = [...linePts, [W, H], [0, H]]
    const duration = 1400, start = performance.now()
    function draw(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      linePoly.setAttribute('points', linePts.map(([x, y]) => `${x},${(H + (y - H) * e).toFixed(2)}`).join(' '))
      areaPoly.setAttribute('points', areaFinal.map(([x, y], i) =>
        i >= linePts.length ? `${x},${y}` : `${x},${(H + (y - H) * e).toFixed(2)}`
      ).join(' '))
      if (p < 1) requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)
  }, [loading, media])

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMsg(null)
    try {
      const res = await fetch('/api/instagram/refresh')
      const data = await res.json()
      if (data.success) {
        setRefreshMsg(`✓ ${data.media_fetched} post · ${data.followers} followers`)
        await fetchData(period)
      } else {
        setRefreshMsg(`✗ ${data.error}`)
      }
    } catch {
      setRefreshMsg('✗ Gagal connect')
    }
    setRefreshing(false)
  }

  const topMedia = [...media]
    .sort((a, b) => (b.instagram_media_insights?.score ?? 0) - (a.instagram_media_insights?.score ?? 0))
    .slice(0, 3)
  const maxScore = Math.max(...topMedia.map(m => m.instagram_media_insights?.score ?? 0), 1)

  const totalLikes = media.reduce((s, m) => s + (m.like_count ?? 0), 0)
  const totalComments = media.reduce((s, m) => s + (m.comments_count ?? 0), 0)
  const totalReach = media.reduce((s, m) => s + (m.instagram_media_insights?.reach ?? 0), 0)
  const engaged = media.filter(m => (m.like_count ?? 0) + (m.comments_count ?? 0) > 0).length

  const lastUpdated = account?.updated_at
    ? (() => {
        const diff = Math.round((Date.now() - new Date(account.updated_at).getTime()) / 60000)
        return diff < 1 ? 'baru saja' : diff < 60 ? `${diff} menit lalu` : `${Math.round(diff / 60)} jam lalu`
      })()
    : null

  const displayName = account?.name ?? account?.username ?? ''

  const metrics = [
    { label: 'Followers', value: account?.followers_count ?? 0 },
    { label: 'Total Likes', value: totalLikes },
    { label: 'Total Reach', value: totalReach },
    { label: 'Komentar', value: totalComments },
    { label: 'Total Post', value: media.length },
    { label: 'Engaged', value: engaged, sub: 'akun' },
    { label: 'Profile Visits', value: 0, sub: 'via snapshot' },
    { label: 'Link Clicks', value: 0, sub: 'via snapshot' },
  ]

  const isDark = theme === 'dark'

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }

    @keyframes igShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    .ig-grad-bg { background: linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA); background-size: 200% 100%; animation: igShift 4s ease infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .skeleton { border-radius: 6px; animation: pulse 1.4s ease infinite; }

    .dash-root {
      height: 100vh; display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: background 0.3s, color 0.3s;
      background: ${isDark ? '#08080f' : '#f7f7fa'};
      color: ${isDark ? '#fff' : '#0a0a14'};
    }

    /* TOPBAR */
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 18px; flex-shrink: 0;
      border-bottom: 0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.08)'};
    }
    .topbar-title { font-size: 15px; font-weight: 600; }
    .topbar-right { display: flex; align-items: center; gap: 8px; }

    .period-btn {
      font-size: 11px; padding: 5px 11px; border-radius: 7px; cursor: pointer;
      border: 0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.15)'};
      color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,10,20,0.45)'};
      background: none; transition: all 0.15s;
    }
    .period-btn.active {
      background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.08)'};
      color: ${isDark ? '#fff' : '#0a0a14'};
      border-color: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,20,0.25)'};
    }
    .period-btn:hover:not(.active) {
      color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(10,10,20,0.7)'};
    }

    .divider { width: 1px; height: 20px; background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.1)'}; margin: 0 4px; }

    .refresh-btn {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; cursor: pointer;
      border: 0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.15)'};
      border-radius: 7px; padding: 5px 11px; background: none;
      color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,10,20,0.5)'};
      transition: all 0.2s;
    }
    .refresh-btn:hover:not(:disabled) { color: ${isDark ? '#fff' : '#0a0a14'}; border-color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,20,0.3)'}; }
    .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .theme-toggle {
      width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
      border: 0.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.18)'};
      background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.05)'};
      color: ${isDark ? '#fff' : '#0a0a14'};
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; transition: all 0.2s; flex-shrink: 0;
    }
    .theme-toggle:hover { background: ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(10,10,20,0.1)'}; }

    .refresh-msg { font-size: 11px; color: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.45)'}; }

    .avatar-wrap {
      width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
      border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,20,0.15)'};
      background: #d3d6da; display: flex; align-items: center; justify-content: center;
    }

    /* BODY */
    .body { display: flex; flex: 1; overflow: hidden; }

    /* SIDEBAR */
    .sidebar {
      width: 60px; flex-shrink: 0;
      border-right: 0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.08)'};
      display: flex; flex-direction: column; align-items: center; padding: 14px 0; gap: 6px;
    }
    .s-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; cursor: pointer; transition: all 0.2s;
      color: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.35)'};
    }
    .s-icon:hover { background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,20,0.05)'}; color: ${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(10,10,20,0.7)'}; }
    .s-icon.active { color: #fff; }

    /* MAIN */
    .main { flex: 1; overflow-y: auto; padding: 18px; }

    /* GREETING */
    .greeting-avatar {
      width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
      background: #d3d6da; display: flex; align-items: center; justify-content: center;
    }
    .greeting-name { font-size: 14px; font-weight: 600; }
    .greeting-sub { font-size: 11px; color: ${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,20,0.4)'}; }

    /* METRIC CARDS */
    .metric-card {
      background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,20,0.03)'};
      border: 0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.1)'};
      border-radius: 12px; padding: 14px; transition: background 0.3s, border-color 0.3s;
    }
    .m-label { font-size: 11px; color: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.45)'}; margin-bottom: 4px; }
    .m-val { font-size: 22px; font-weight: 700; }
    .m-sub { font-size: 10px; color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,20,0.35)'}; margin-top: 3px; }

    /* CHART CARD */
    .chart-card {
      background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,20,0.03)'};
      border: 0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.1)'};
      border-radius: 12px; padding: 14px; margin-bottom: 18px;
    }

    /* TOP KONTEN */
    .section-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
    .thumb-card {
      background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(10,10,20,0.02)'};
      border: 0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.1)'};
      border-radius: 10px; overflow: hidden; cursor: pointer; transition: border-color 0.2s;
      text-decoration: none; display: block;
    }
    .thumb-card:hover { border-color: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,20,0.25)'}; }
    .thumb-img {
      width: 100%; height: 90px; overflow: hidden;
      background: ${isDark ? 'linear-gradient(135deg,#2a1a3a,#1a1430)' : '#e8e8f0'};
      display: flex; align-items: center; justify-content: center;
      color: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,20,0.2)'}; font-size: 22px;
    }
    .thumb-img img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-caption {
      font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      color: ${isDark ? '#fff' : '#0a0a14'};
    }
    .thumb-sub { font-size: 10px; color: ${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,20,0.4)'}; margin-top: 2px; }
    .score-bar-bg { height: 4px; background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.08)'}; border-radius: 2px; margin-top: 6px; overflow: hidden; }
    .score-bar-fill { height: 4px; border-radius: 2px; transform: scaleX(0); transform-origin: left; transition: transform 1.1s cubic-bezier(0.22,1,0.36,1); }

    .see-all {
      display: flex; align-items: center; justify-content: center;
      border-style: dashed !important; text-decoration: none;
      color: ${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,20,0.35)'};
    }

    .skeleton-bg { background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,20,0.06)'}; }
  `

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      <style>{css}</style>

      <div className="dash-root">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-title">Overview</div>
          <div className="topbar-right">
            {([7, 30, 90] as Period[]).map(p => (
              <button
                key={p}
                className={`period-btn${period === p ? ' active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p} hari
              </button>
            ))}
            <div className="divider" />
            {refreshMsg && <span className="refresh-msg">{refreshMsg}</span>}
            <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
              <i className="ti ti-refresh" style={{ fontSize: 13 }} />
              {refreshing ? 'Memperbarui...' : 'Refresh'}
            </button>
            <button className="theme-toggle" onClick={() => setTheme(isDark ? 'light' : 'dark')} title="Toggle theme">
              <i className={`ti ${isDark ? 'ti-moon' : 'ti-sun'}`} />
            </button>
            <div className="avatar-wrap">
              {account?.profile_picture_url
                ? <img src={account.profile_picture_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <svg width="20" height="20" viewBox="0 0 24 24" fill={isDark ? 'white' : '#0a0a14'}><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.5 0-10.4 1.8-10.4 5.3v1.1h20.8v-1.1c0-3.5-6.9-5.3-10.4-5.3z" /></svg>
              }
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="body">

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="s-icon active" style={{ background: 'linear-gradient(135deg,#FF7A00,#FF0069,#7638FA)' }}>
              <i className="ti ti-layout-dashboard" />
            </div>
            <div className="s-icon"><i className="ti ti-photo" /></div>
            <div className="s-icon"><i className="ti ti-chart-bar" /></div>
            <div className="s-icon"><i className="ti ti-users" /></div>
            <div className="s-icon"><i className="ti ti-bulb" /></div>
            <div className="s-icon" style={{ marginTop: 'auto' }}><i className="ti ti-settings" /></div>
          </div>

          {/* MAIN */}
          <div className="main">

            {/* Greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div className="greeting-avatar">
                {account?.profile_picture_url
                  ? <img src={account.profile_picture_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill={isDark ? 'white' : '#0a0a14'}><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.5 0-10.4 1.8-10.4 5.3v1.1h20.8v-1.1c0-3.5-6.9-5.3-10.4-5.3z" /></svg>
                }
              </div>
              <div>
                <div className="greeting-name">
                  {loading ? 'Memuat...' : `Selamat datang, ${displayName} 👋`}
                </div>
                <div className="greeting-sub">
                  {account ? `@${account.username}` : '—'}
                  {lastUpdated ? ` · Update ${lastUpdated}` : ''}
                </div>
              </div>
            </div>

            {/* Metric grid row 1 */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="metric-card">
                    <div className={`skeleton skeleton-bg`} style={{ height: 11, width: '60%', marginBottom: 8 }} />
                    <div className={`skeleton skeleton-bg`} style={{ height: 22, width: '80%' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
                {metrics.slice(0, 4).map((m, i) => (
                  <div key={i} className="metric-card">
                    <div className="m-label">{m.label}</div>
                    <div className="m-val">
                      <span ref={el => { metricsRef.current[i] = el }} data-target={m.value}>0</span>
                    </div>
                    {m.sub && <div className="m-sub">{m.sub}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Metric grid row 2 */}
            {!loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                {metrics.slice(4).map((m, i) => (
                  <div key={i} className="metric-card">
                    <div className="m-label">{m.label}</div>
                    <div className="m-val">
                      <span ref={el => { metricsRef.current[i + 4] = el }} data-target={m.value}>0</span>
                    </div>
                    {m.sub && <div className="m-sub">{m.sub}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Chart */}
            <div className="chart-card">
              <div className="m-label" style={{ marginBottom: 8 }}>Reach per konten — {period} hari terakhir</div>
              <svg width="100%" height="56" viewBox="0 0 600 56" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF0069" stopOpacity={isDark ? 0.35 : 0.2} />
                    <stop offset="100%" stopColor="#FF0069" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFD600" />
                    <stop offset="50%" stopColor="#FF0069" />
                    <stop offset="100%" stopColor="#7638FA" />
                  </linearGradient>
                </defs>
                <polygon id="areaPoly" points="0,56 600,56 600,56 0,56" fill="url(#areaGrad)" />
                <polyline id="linePoly" points="0,56 600,56" fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Top konten */}
            <div className="section-title">Top konten</div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="thumb-card">
                    <div className={`skeleton skeleton-bg`} style={{ height: 90 }} />
                    <div style={{ padding: 8 }}>
                      <div className={`skeleton skeleton-bg`} style={{ height: 11, marginBottom: 6 }} />
                      <div className={`skeleton skeleton-bg`} style={{ height: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : media.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: 13, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,20,0.4)' }}>
                Tidak ada konten dalam {period} hari terakhir. Coba pilih periode lebih panjang.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {topMedia.map((m, i) => {
                  const thumb = m.thumbnail_url ?? m.media_url
                  const score = m.instagram_media_insights?.score ?? 0
                  const barWidth = Math.round((score / maxScore) * 100)
                  const caption = m.caption?.split('\n')[0] ?? '(tanpa caption)'
                  return (
                    <a key={m.media_id} className="thumb-card" href={m.permalink} target="_blank" rel="noreferrer">
                      <div className="thumb-img">
                        {thumb ? <img src={thumb} alt="" /> : <i className="ti ti-photo" />}
                      </div>
                      <div style={{ padding: 8 }}>
                        <div className="thumb-caption">{caption}</div>
                        <div className="thumb-sub">{m.like_count} likes · skor {score.toFixed(1)}</div>
                        <div className="score-bar-bg">
                          <div className="score-bar-fill ig-grad-bg" data-width={barWidth} ref={el => { scoreBarRefs.current[i] = el }} />
                        </div>
                      </div>
                    </a>
                  )
                })}
                <a href="#" className="thumb-card see-all">
                  <div style={{ fontSize: 11, textAlign: 'center', padding: 14 }}>
                    <i className="ti ti-arrow-right" style={{ display: 'block', fontSize: 18, marginBottom: 4 }} />
                    Lihat semua konten
                  </div>
                </a>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}