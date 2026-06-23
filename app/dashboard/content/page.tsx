'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type MediaItem = {
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

type SortKey = 'score' | 'like_count' | 'comments_count' | 'timestamp'
type FilterType = 'ALL' | 'CAROUSEL_ALBUM' | 'IMAGE' | 'VIDEO'

export default function ContentPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortAsc, setSortAsc] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>('ALL')

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
      setMedia(json.media || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  const counts: Record<string, number> = { ALL: media.length }
  media.forEach(m => { counts[m.media_type] = (counts[m.media_type] || 0) + 1 })

  const filtered = media.filter(m => filterType === 'ALL' || m.media_type === filterType)
  const sorted = [...filtered].sort((a, b) => {
    let av: number, bv: number
    if (sortKey === 'timestamp') {
      av = a.timestamp ? new Date(a.timestamp).getTime() : 0
      bv = b.timestamp ? new Date(b.timestamp).getTime() : 0
    } else if (sortKey === 'score') {
      av = a.instagram_media_insights?.score ?? -1
      bv = b.instagram_media_insights?.score ?? -1
    } else {
      av = a[sortKey] ?? -1
      bv = b[sortKey] ?? -1
    }
    return sortAsc ? av - bv : bv - av
  })

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
  const chipBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.12)'
  const chipColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,10,20,0.5)'
  const chipActiveBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.08)'
  const chipActiveBorder = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,20,0.2)'
  const thBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.08)'
  const thColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,10,20,0.35)'
  const tdBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,20,0.05)'
  const thumbBg = isDark ? 'linear-gradient(135deg,#2a1a3a,#1a1430)' : 'linear-gradient(135deg,#e8e0f0,#d0c8e8)'
  const thumbColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,20,0.15)'
  const toggleBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.06)'
  const sIconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.4)'
  const typeBadgeBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.06)'
  const typeBadgeColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,10,20,0.4)'
  const trHover = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(10,10,20,0.025)'

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null
    return <i className={`ti ti-arrow-${sortAsc ? 'up' : 'down'}`} style={{ fontSize: 10, marginLeft: 3 }} />
  }

  function scoreColor(score: number | null) {
    if (score === null) return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.08)'
    if (score >= 80) return 'linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA)'
    if (score >= 50) return 'linear-gradient(90deg,#FF7A00,#FF0069)'
    return isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.1)'
  }

  function formatDate(ts: string | null) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
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

  const FILTER_CHIPS: { label: string; value: FilterType }[] = [
    { label: `Semua (${counts.ALL || 0})`, value: 'ALL' },
    { label: `Reels (${counts.VIDEO || 0})`, value: 'VIDEO' },
    { label: `Carousel (${counts.CAROUSEL_ALBUM || 0})`, value: 'CAROUSEL_ALBUM' },
    { label: `Foto (${counts.IMAGE || 0})`, value: 'IMAGE' },
  ]

  return (
    <>
    <title>Konten — Creator Performance Intelligence Dashboard</title>
    <div style={{ height: '100vh', overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes igShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .tr-hover:hover td { background: ${trHover}; cursor: pointer; }
      `}</style>

      {/* NAVBAR */}
      <div style={{ padding: '10px 12px 0', flexShrink: 0 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderRadius: 12, border: `0.5px solid ${navBorder}`, backdropFilter: 'blur(16px)', background: navBg, transition: 'all 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <FreehandLogo color={textPrimary} />
            <span style={{ fontSize: 12, fontWeight: 500, color: textPrimary }}>freehandtools</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href="mailto:freehandtools@gmail.com?subject=Masalah%20Konten%20Page%20—%20freehandtools-dashboard.vercel.app&body=Halo%2C%20kak.%20Saat%20ini%2C%20halaman%20Konten%20yang%20saya%20buka%20ada%20suatu%20masalah.%20Tolong%20perbaiki%20bagian%20yang%20eror%20atau%20bermasalah.%20Terima%20kasih%20%F0%9F%99%8F" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, background: cardBg, border: `0.5px solid ${navBorder}`, borderRadius: 8, padding: '0 14px', fontSize: 11, color: textPrimary, textDecoration: 'none', cursor: 'pointer' }}>
              <i className="ti ti-message" style={{ fontSize: 13 }} />Hubungi Kami
            </a>
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
          <div style={{ fontSize: 18, fontWeight: 900, color: textPrimary }}>Konten</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => toggleSort('timestamp')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: textSecondary, cursor: 'pointer', border: `0.5px solid ${chipBorder}`, borderRadius: 7, padding: '5px 11px', background: 'transparent' }}>
              <i className="ti ti-sort-descending" style={{ fontSize: 13 }} /> Terbaru <SortIcon k="timestamp" />
            </button>
            <button onClick={() => toggleSort('score')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: textSecondary, cursor: 'pointer', border: `0.5px solid ${chipBorder}`, borderRadius: 7, padding: '5px 11px', background: 'transparent' }}>
              <i className="ti ti-star" style={{ fontSize: 13 }} /> Skor <SortIcon k="score" />
            </button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d3d6da', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${navBorder}`, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.5 0-10.4 1.8-10.4 5.3v1.1h20.8v-1.1c0-3.5-6.9-5.3-10.4-5.3z" /></svg>
            </div>
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
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: sIconColor, cursor: 'pointer' }}>
                <i className="ti ti-settings" />
              </div>
            </Link>
          </div>

          {/* MAIN SCROLL */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
              {FILTER_CHIPS.map(chip => (
                <button key={chip.value} onClick={() => setFilterType(chip.value)} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 16, border: `0.5px solid ${filterType === chip.value ? chipActiveBorder : chipBorder}`, color: filterType === chip.value ? textPrimary : chipColor, background: filterType === chip.value ? chipActiveBg : 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 56, borderRadius: 8, background: cardBg, border: `0.5px solid ${cardBorder}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && sorted.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: textTertiary }}>
                <i className="ti ti-photo-off" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                <div style={{ fontSize: 13 }}>Belum ada konten</div>
                <button onClick={() => router.push('/loading-data')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 20, border: 'none', background: 'linear-gradient(90deg,#FF7A00,#FF0069,#7638FA)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                  Refresh Data
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && sorted.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 10, fontWeight: 500, color: thColor, textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${thBorder}`, textTransform: 'uppercase', letterSpacing: '0.04em', width: '38%' }}>Konten</th>
                    <th style={{ fontSize: 10, fontWeight: 500, color: thColor, textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${thBorder}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tipe</th>
                    <th onClick={() => toggleSort('like_count')} style={{ fontSize: 10, fontWeight: 500, color: thColor, textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${thBorder}`, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none' }}>Likes <SortIcon k="like_count" /></th>
                    <th onClick={() => toggleSort('comments_count')} style={{ fontSize: 10, fontWeight: 500, color: thColor, textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${thBorder}`, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none' }}>Komen <SortIcon k="comments_count" /></th>
                    <th style={{ fontSize: 10, fontWeight: 500, color: thColor, textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${thBorder}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Saves</th>
                    <th style={{ fontSize: 10, fontWeight: 500, color: thColor, textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${thBorder}`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reach</th>
                    <th onClick={() => toggleSort('score')} style={{ fontSize: 10, fontWeight: 500, color: thColor, textAlign: 'left', padding: '8px 10px', borderBottom: `0.5px solid ${thBorder}`, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none' }}>Skor <SortIcon k="score" /></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(item => {
                    const ins = item.instagram_media_insights
                    const score = ins?.score ?? null
                    return (
                      <tr key={item.id} className="tr-hover" onClick={() => router.push(`/dashboard/content/${item.media_id}`)}>
                        <td style={{ fontSize: 12, color: textPrimary, padding: 10, borderBottom: `0.5px solid ${tdBorder}`, verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: thumbBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: thumbColor, fontSize: 14, flexShrink: 0 }}>
                              {item.thumbnail_url || item.media_url
                                ? <img src={item.thumbnail_url || item.media_url || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                : <i className="ti ti-photo" />
                              }
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220, color: textPrimary }}>
                                {item.caption || '(tanpa caption)'}
                              </div>
                              <div style={{ fontSize: 10, color: textTertiary, marginTop: 2 }}>{formatDate(item.timestamp)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: textPrimary, padding: 10, borderBottom: `0.5px solid ${tdBorder}`, verticalAlign: 'middle' }}>
                          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, background: typeBadgeBg, color: typeBadgeColor }}>{typeLabel(item.media_type)}</span>
                        </td>
                        <td style={{ fontSize: 12, color: item.like_count ? textPrimary : textTertiary, padding: 10, borderBottom: `0.5px solid ${tdBorder}`, verticalAlign: 'middle' }}>{item.like_count ?? '—'}</td>
                        <td style={{ fontSize: 12, color: item.comments_count ? textPrimary : textTertiary, padding: 10, borderBottom: `0.5px solid ${tdBorder}`, verticalAlign: 'middle' }}>{item.comments_count ?? '—'}</td>
                        <td style={{ fontSize: 12, color: ins?.saved ? textPrimary : textTertiary, padding: 10, borderBottom: `0.5px solid ${tdBorder}`, verticalAlign: 'middle' }}>{ins?.saved ?? '—'}</td>
                        <td style={{ fontSize: 12, color: ins?.reach ? textPrimary : textTertiary, padding: 10, borderBottom: `0.5px solid ${tdBorder}`, verticalAlign: 'middle' }}>{ins?.reach ?? '—'}</td>
                        <td style={{ fontSize: 12, padding: 10, borderBottom: `0.5px solid ${tdBorder}`, verticalAlign: 'middle' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, color: score ? '#fff' : textTertiary, background: scoreColor(score), backgroundSize: '200% 100%', animation: score && score >= 80 ? 'igShift 4s ease infinite' : undefined }}>
                            {score !== null ? Math.round(score) : '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {!loading && sorted.length > 0 && (
              <div style={{ textAlign: 'center', fontSize: 11, color: textTertiary, padding: '24px 0' }}>
                {sorted.length} konten · klik baris untuk lihat detail
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
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