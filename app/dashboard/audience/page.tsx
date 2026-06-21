'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'

type DashboardData = {
  account: { followers_count: number | null; username: string | null } | null
  media: { instagram_media_insights: { reach: number | null } | null }[]
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

function animateBar(el: HTMLElement, targetPct: number, duration = 1100) {
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    el.style.width = `${targetPct * eased}%`
    if (p < 1) requestAnimationFrame(step)
    else el.style.width = `${targetPct}%`
  }
  requestAnimationFrame(step)
}

function animateDonut(el: SVGCircleElement, targetPct: number, duration = 1200) {
  const circumference = 97.4
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    const filled = (targetPct / 100) * circumference * eased
    el.setAttribute('stroke-dasharray', `${filled.toFixed(2)} ${(circumference - filled).toFixed(2)}`)
    if (p < 1) requestAnimationFrame(step)
    else el.setAttribute('stroke-dasharray', `${((targetPct / 100) * circumference).toFixed(2)} ${(circumference - (targetPct / 100) * circumference).toFixed(2)}`)
  }
  requestAnimationFrame(step)
}

export default function AudiencePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const followerCountRef = useRef<HTMLSpanElement | null>(null)
  const barRefs = useRef<(HTMLDivElement | null)[]>([])
  const animated = useRef(false)
  const donutRef = useRef<SVGCircleElement | null>(null)

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
    animated.current = false
    try {
      const res = await fetch('/api/dashboard/data')
      const json = await res.json()
      setData(json)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Animasi setelah data loaded
  useEffect(() => {
    if (loading || animated.current || !data) return
    animated.current = true

    if (donutRef.current && followerReach !== null) {
      animateDonut(donutRef.current, followerReach)
    }

    // Count-up followers
    if (followerCountRef.current) {
      animateCount(followerCountRef.current, data.account?.followers_count ?? 0)
    }

    // Bar fill animation — delay sedikit supaya DOM siap
    setTimeout(() => {
      barRefs.current.forEach(el => {
        if (!el) return
        const target = parseFloat(el.dataset.pct ?? '0')
        animateBar(el, target)
      })
    }, 50)
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
  const barBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,20,0.06)'
  const noticeColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,20,0.3)'

  const followers = data?.account?.followers_count ?? 0
  const needsMore = followers < 100
  const totalReach = data?.media.reduce((s, m) => s + (m.instagram_media_insights?.reach ?? 0), 0) ?? 0
  const followerReach = totalReach > 0 && followers > 0
    ? Math.min(Math.round((followers / (totalReach + followers)) * 100), 100)
    : null
  const nonFollowerReach = followerReach !== null ? 100 - followerReach : null

  const SIDEBAR_ITEMS = [
    { icon: 'ti-layout-dashboard', href: '/dashboard' },
    { icon: 'ti-photo', href: '/dashboard/content' },
    { icon: 'ti-chart-bar', href: '/dashboard/stats' },
    { icon: 'ti-users', href: '/dashboard/audience', active: true },
    { icon: 'ti-bulb', href: '/dashboard/ai' },
  ]

  // Semua bars didefinisikan di sini agar index ref konsisten
  const BAR_DEFS = [
    // Gender
    { label: 'Perempuan', pct: needsMore ? 0 : 62, color: 'linear-gradient(90deg,#FF7A00,#FF0069)' },
    { label: 'Laki-laki', pct: needsMore ? 0 : 38, color: 'rgba(118,56,250,0.6)' },
    // Usia
    { label: '13–17', pct: needsMore ? 0 : 5, color: '#FFD600' },
    { label: '18–24', pct: needsMore ? 0 : 38, color: '#FF7A00' },
    { label: '25–34', pct: needsMore ? 0 : 32, color: '#FF0069' },
    { label: '35–44', pct: needsMore ? 0 : 16, color: '#D300C5' },
    { label: '45+', pct: needsMore ? 0 : 9, color: '#7638FA' },
    // Lokasi
    { label: 'Jakarta', pct: needsMore ? 0 : 42, color: 'linear-gradient(90deg,#FF7A00,#FF0069)' },
    { label: 'Bandung', pct: needsMore ? 0 : 18, color: 'linear-gradient(90deg,#FF0069,#D300C5)' },
    { label: 'Surabaya', pct: needsMore ? 0 : 12, color: 'linear-gradient(90deg,#D300C5,#7638FA)' },
    { label: 'Lainnya', pct: needsMore ? 0 : 28, color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,20,0.15)' },
  ]

  function BarRow({ bar, refIndex }: { bar: typeof BAR_DEFS[0]; refIndex: number }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <div style={{ fontSize: 11, color: textSecondary, width: 70, flexShrink: 0 }}>{bar.label}</div>
        <div style={{ flex: 1, height: 7, background: barBg, borderRadius: 4, overflow: 'hidden' }}>
          <div
            ref={el => { barRefs.current[refIndex] = el }}
            data-pct={bar.pct}
            style={{ height: 7, borderRadius: 4, width: '0%', background: bar.color }}
          />
        </div>
        <div style={{ fontSize: 11, color: textPrimary, width: 32, textAlign: 'right' }}>{bar.pct}%</div>
      </div>
    )
  }

  function NoticeBox({ text }: { text: string }) {
    return (
      <div style={{ fontSize: 11, color: noticeColor, fontStyle: 'italic', marginBottom: 10 }}>
        <i className="ti ti-info-circle" style={{ fontSize: 12, marginRight: 4 }} />
        {text}
      </div>
    )
  }

  function Card({ children, title }: { children: React.ReactNode; title: string }) {
    return (
      <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 11, color: textTertiary, marginBottom: 10 }}>{title}</div>
        {children}
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`@keyframes shimmer { 0%{opacity:0.4} 50%{opacity:0.8} 100%{opacity:0.4} }`}</style>

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
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', borderBottom: `0.5px solid ${topbarBorder}`, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: textPrimary }}>Audiens</span>
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
                {[100, 140, 140, 100].map((h, i) => (
                  <div key={i} style={{ height: h, borderRadius: 12, background: cardBg, animation: 'shimmer 1.5s ease infinite' }} />
                ))}
              </div>
            ) : (
              <>
                {needsMore && (
                  <div style={{ background: 'rgba(251,191,36,0.08)', border: '0.5px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="ti ti-alert-triangle" style={{ fontSize: 14, flexShrink: 0 }} />
                    Sebagian data demografi memerlukan minimal 100 followers. Akun ini memiliki{' '}
                    <span ref={followerCountRef}>0</span> followers.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
                  {/* Followers vs Non-followers */}
                  <Card title="Followers vs Non-followers">
                    {followerReach !== null ? (
                      <>
                        <svg width="80" height="80" viewBox="0 0 36 36" style={{ display: 'block', margin: '0 auto 8px' }}>
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke={barBg} strokeWidth="4" />
                          <circle ref={donutRef} cx="18" cy="18" r="15.5" fill="none"
                            stroke="url(#donutGrad)" strokeWidth="4"
                            strokeDasharray="0 97.4"
                            strokeDashoffset="24.4"
                            transform="rotate(-90 18 18)"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#FF7A00" />
                              <stop offset="100%" stopColor="#7638FA" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{ fontSize: 11, color: textSecondary, textAlign: 'center' }}>
                          {followerReach}% Followers · {nonFollowerReach}% Non
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 11, color: textTertiary, fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                        Data reach belum tersedia
                      </div>
                    )}
                  </Card>

                  {/* Gender */}
                  <Card title="Gender">
                    {needsMore && <NoticeBox text="Tersedia jika followers ≥ 100" />}
                    <BarRow bar={BAR_DEFS[0]} refIndex={0} />
                    <BarRow bar={BAR_DEFS[1]} refIndex={1} />
                    {needsMore && <div style={{ fontSize: 10, color: textTertiary, marginTop: 4 }}>Data ilustratif</div>}
                  </Card>

                  {/* Usia */}
                  <Card title="Rentang Usia">
                    {needsMore && <NoticeBox text="Tersedia jika followers ≥ 100" />}
                    <BarRow bar={BAR_DEFS[2]} refIndex={2} />
                    <BarRow bar={BAR_DEFS[3]} refIndex={3} />
                    <BarRow bar={BAR_DEFS[4]} refIndex={4} />
                    <BarRow bar={BAR_DEFS[5]} refIndex={5} />
                    <BarRow bar={BAR_DEFS[6]} refIndex={6} />
                    {needsMore && <div style={{ fontSize: 10, color: textTertiary, marginTop: 4 }}>Data ilustratif</div>}
                  </Card>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {/* Waktu terbaik */}
                  <Card title="Waktu terbaik untuk posting">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
                      {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
                        <div key={d} style={{ fontSize: 9, color: textTertiary, textAlign: 'center' }}>{d}</div>
                      ))}
                      {[0.2, 0.9, 0.3, 0.85, 0.25, 0.5, 0.15].map((intensity, i) => (
                        <div key={i} style={{ height: 18, borderRadius: 4, background: intensity > 0.7 ? 'linear-gradient(135deg,#FF7A00,#FF0069)' : intensity > 0.4 ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,20,0.12)') : barBg }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: textSecondary }}>Terbaik: Selasa & Kamis · 07:00–09:00</div>
                    <div style={{ fontSize: 10, color: textTertiary, marginTop: 4, fontStyle: 'italic' }}>Estimasi berdasarkan pola umum akun serupa</div>
                  </Card>

                  {/* Lokasi */}
                  <Card title="Lokasi top audiens">
                    {needsMore && <NoticeBox text="Tersedia jika followers ≥ 100" />}
                    <BarRow bar={BAR_DEFS[7]} refIndex={7} />
                    <BarRow bar={BAR_DEFS[8]} refIndex={8} />
                    <BarRow bar={BAR_DEFS[9]} refIndex={9} />
                    <BarRow bar={BAR_DEFS[10]} refIndex={10} />
                    {needsMore && <div style={{ fontSize: 10, color: textTertiary, marginTop: 4 }}>Data ilustratif</div>}
                  </Card>
                </div>

                <div style={{ fontSize: 11, color: textTertiary, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
                  Data demografi lengkap tersedia setelah akun mencapai 100 followers dan App Review Meta disetujui.
                </div>
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