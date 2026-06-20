'use client'

import { useEffect, useState } from 'react'

interface InsightItem {
  judul: string
  penjelasan: string
}

interface InsightsData {
  kekuatan: InsightItem[]
  blind_spot: InsightItem[]
  peluang: InsightItem[]
  ide_konten: string[]
}

export default function AIInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/insights')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal generate')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generate() }, [])

  const isDark = theme === 'dark'
  const bg = isDark ? '#08080f' : '#f7f7fa'
  const textPrimary = isDark ? '#fff' : '#0a0a14'
  const textSecondary = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.5)'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.1)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,20,0.03)'
  const navBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'
  const borderStrong = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.18)'
  const topbarBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.08)'
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.08)'
  const sideIconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.35)'

  return (
    <div style={{ height: '100vh', background: bg, transition: 'background 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* NAVBAR */}
      <div style={{ padding: '10px 12px 0', flexShrink: 0, background: bg, zIndex: 20 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderRadius: 12, border: `0.5px solid ${borderStrong}`, backdropFilter: 'blur(16px)', background: navBg, transition: 'all 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 500 420" fill={textPrimary}>
              <path d="M209.73,104.87c0,11.58-9.39,20.97-20.97,20.97h-62.92v62.92c0,11.58-9.39,20.97-20.97,20.97-11.58,0-20.97-9.39-20.97-20.97v-62.92H20.97C9.39,125.84,0,116.45,0,104.87c0-11.58,9.39-20.97,20.97-20.97h62.92V20.97C83.89,9.39,93.28,0,104.86,0c11.58,0,20.97,9.39,20.97,20.97v62.93h62.92c11.58,0,20.97,9.39,20.97,20.97Z"/>
              <path d="M440.43,356.53v10.5c0,5.79-4.69,10.48-10.48,10.48-5.79,0-10.48-4.69-10.48-10.48-0-5.79-4.7-10.49-10.49-10.49-5.79,0-10.49,4.7-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-10.49c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-31.46c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v41.94c0,28.96-23.48,52.43-52.43,52.43-28.96,0-52.43-23.48-52.43-52.43v-136.32c0-11.58,9.39-20.97,20.97-20.97,11.58,0,20.97,9.39,20.97,20.97v136.32c0,5.79,4.69,10.48,10.48,10.48,5.79,0,10.48-4.69,10.48-10.48v-52.43c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94v31.46c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.95,41.95-41.95,23.17,0,41.95,18.78,41.95,41.95v10.49c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94Z"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 500, color: textPrimary }}>freehandtools</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32 }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, boxSizing: 'border-box', background: cardBg, border: `0.5px solid ${borderStrong}`, borderRadius: 8, padding: '0 14px', fontSize: 11, color: textPrimary, cursor: 'pointer' }}>
              <i className="ti ti-message" style={{ fontSize: 13 }}></i> Hubungi Kami
            </button>
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} style={{ width: 32, height: 32, boxSizing: 'border-box', borderRadius: 8, border: `0.5px solid ${borderStrong}`, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: textPrimary, fontSize: 16 }}>
              <i className={isDark ? 'ti ti-moon' : 'ti ti-sun'}></i>
            </button>
          </div>
        </nav>
      </div>

      {/* APP SHELL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 12px 12px', minHeight: 0 }}>
        <div style={{ flex: 1, borderRadius: 14, border: `0.5px solid ${border}`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          {/* TOPBAR */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `0.5px solid ${topbarBorder}`, flexShrink: 0, background: bg, borderRadius: '14px 14px 0 0' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: textPrimary }}>AI Insights</div>
            <button
              onClick={generate}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 600, color: '#0a0a14', background: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              <i className="ti ti-refresh" style={{ fontSize: 13 }}></i>
              {loading ? 'Generating...' : 'Generate ulang'}
            </button>
          </div>

          {/* BODY */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

            {/* SIDEBAR */}
            <div style={{ width: 60, borderRight: `0.5px solid ${sidebarBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 6, flexShrink: 0 }}>
              {[
                { icon: 'ti-layout-dashboard' },
                { icon: 'ti-photo' },
                { icon: 'ti-chart-bar' },
                { icon: 'ti-users' },
                { icon: 'ti-bulb', active: true },
              ].map((item, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: item.active ? '#fff' : sideIconColor, background: item.active ? 'linear-gradient(135deg,#FF7A00,#FF0069,#7638FA)' : 'transparent', cursor: 'pointer' }}>
                  <i className={`ti ${item.icon}`}></i>
                </div>
              ))}
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: sideIconColor, marginTop: 'auto', cursor: 'pointer' }}>
                <i className="ti ti-settings"></i>
              </div>
            </div>

            {/* MAIN SCROLL */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>

              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 14 }}>
                  <div style={{ width: 36, height: 36, border: `2.5px solid ${border}`, borderTopColor: '#FF0069', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }}></div>
                  <div style={{ fontSize: 13, color: textSecondary }}>Gemini sedang menganalisis konten kamu...</div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {!loading && error && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: 16, color: '#f87171', fontSize: 13 }}>
                  ⚠️ {error}
                </div>
              )}

              {!loading && data && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
                    <div style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: textPrimary, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <i className="ti ti-trending-up" style={{ color: '#4ade80' }}></i> 3 Kekuatan Konten
                      </div>
                      <div style={{ fontSize: 10, color: textSecondary, marginBottom: 8 }}>Yang sudah berjalan baik, lanjutkan</div>
                      {data.kekuatan.map((item, i) => (
                        <div key={i} style={{ fontSize: 12, color: textPrimary, padding: '8px 0', borderBottom: i < 2 ? `0.5px solid ${border}` : 'none', lineHeight: 1.5 }}>
                          ✦ {item.judul}
                          <div style={{ fontSize: 11, color: textSecondary, marginTop: 3 }}>{item.penjelasan}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: textPrimary, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <i className="ti ti-alert-triangle" style={{ color: '#fbbf24' }}></i> 3 Blind Spot
                      </div>
                      <div style={{ fontSize: 10, color: textSecondary, marginBottom: 8 }}>Belum disadari, perlu diperbaiki</div>
                      {data.blind_spot.map((item, i) => (
                        <div key={i} style={{ fontSize: 12, color: textPrimary, padding: '8px 0', borderBottom: i < 2 ? `0.5px solid ${border}` : 'none', lineHeight: 1.5 }}>
                          ✦ {item.judul}
                          <div style={{ fontSize: 11, color: textSecondary, marginTop: 3 }}>{item.penjelasan}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: textPrimary, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <i className="ti ti-rocket" style={{ color: '#c084fc' }}></i> 3 Peluang
                      </div>
                      <div style={{ fontSize: 10, color: textSecondary, marginBottom: 8 }}>Belum dimanfaatkan, potensi besar</div>
                      {data.peluang.map((item, i) => (
                        <div key={i} style={{ fontSize: 12, color: textPrimary, padding: '8px 0', borderBottom: i < 2 ? `0.5px solid ${border}` : 'none', lineHeight: 1.5 }}>
                          ✦ {item.judul}
                          <div style={{ fontSize: 11, color: textSecondary, marginTop: 3 }}>{item.penjelasan}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: cardBg, border: `0.5px solid ${border}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: textPrimary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="ti ti-calendar"></i> 10 Ide Konten Pekan Ini
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {data.ide_konten.map((ide, i) => (
                        <div key={i} style={{ fontSize: 11, color: textPrimary, padding: '8px 10px', border: `0.5px solid ${border}`, borderRadius: 7 }}>
                          {i + 1}. {ide}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}