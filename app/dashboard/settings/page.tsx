'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Account = {
  username: string | null
  name: string | null
  profile_picture_url: string | null
  followers_count: number | null
  updated_at: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [account, setAccount] = useState<Account | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
    const ar = localStorage.getItem('autoRefresh')
    if (ar !== null) setAutoRefresh(ar === 'true')
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  function toggleAutoRefresh() {
    const next = !autoRefresh
    setAutoRefresh(next)
    localStorage.setItem('autoRefresh', String(next))
  }

  const fetchAccount = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/data')
      const json = await res.json()
      if (json.account) setAccount(json.account)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchAccount() }, [fetchAccount])

  async function handleDisconnect() {
    if (!confirm('Yakin ingin memutuskan koneksi Instagram?')) return
    setDisconnecting(true)
    try {
      await fetch('/api/instagram/disconnect', { method: 'POST' })
      router.push('/')
    } catch {
      setDisconnecting(false)
    }
  }

  function formatDate(ts: string | null) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

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
  const itemBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,20,0.06)'
  const groupLabelColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,20,0.3)'

  const SIDEBAR_ITEMS = [
    { icon: 'ti-layout-dashboard', href: '/dashboard' },
    { icon: 'ti-photo', href: '/dashboard/content' },
    { icon: 'ti-chart-bar', href: '/dashboard/stats' },
    { icon: 'ti-users', href: '/dashboard/audience' },
    { icon: 'ti-bulb', href: '/dashboard/ai' },
  ]

  function SettingsItem({ label, right, danger = false }: { label: string; right: React.ReactNode; danger?: boolean }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: `0.5px solid ${itemBorder}` }}>
        <div style={{ fontSize: 13, color: danger ? '#f87171' : textPrimary }}>{label}</div>
        <div style={{ fontSize: 12, color: textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}>{right}</div>
      </div>
    )
  }

  function GroupLabel({ label }: { label: string }) {
    return <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: groupLabelColor, margin: '20px 0 4px' }}>{label}</div>
  }

  function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
    return (
      <div onClick={onClick} style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: on ? 'linear-gradient(90deg,#FF7A00,#FF0069,#7638FA)' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,20,0.15)'), transition: 'background 0.3s' }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 19 : 3, transition: 'left 0.2s' }} />
      </div>
    )
  }

  return (
    <>
    <title>Pengaturan — Creator Performance Intelligence Dashboard</title>
    <div style={{ height: '100vh', overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`@keyframes igShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }`}</style>

      {/* NAVBAR */}
      <div style={{ padding: '10px 12px 0', flexShrink: 0 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderRadius: 12, border: `0.5px solid ${navBorder}`, backdropFilter: 'blur(16px)', background: navBg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <FreehandLogo color={textPrimary} />
            <span style={{ fontSize: 12, fontWeight: 500, color: textPrimary }}>freehandtools</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href="mailto:freehandtools@gmail.com?subject=Masalah%20Pengaturan%20Page%20—%20freehandtools-dashboard.vercel.app&body=Halo%2C%20kak.%20Saat%20ini%2C%20halaman%20Pengaturan%20yang%20saya%20buka%20ada%20suatu%20masalah.%20Tolong%20perbaiki%20bagian%20yang%20eror%20atau%20bermasalah.%20Terima%20kasih%20%F0%9F%99%8F" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, background: cardBg, border: `0.5px solid ${navBorder}`, borderRadius: 8, padding: '0 14px', fontSize: 11, color: textPrimary, textDecoration: 'none', cursor: 'pointer' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', borderBottom: `0.5px solid ${topbarBorder}`, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: textPrimary }}>Pengaturan</span>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {/* SIDEBAR */}
          <div style={{ width: 60, borderRight: `0.5px solid ${sidebarBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 6, flexShrink: 0 }}>
            {SIDEBAR_ITEMS.map((item, i) => (
              <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: sIconColor, cursor: 'pointer' }}>
                  <i className={`ti ${item.icon}`} />
                </div>
              </Link>
            ))}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#fff', background: 'linear-gradient(135deg,#FF7A00,#FF0069,#7638FA)', cursor: 'pointer' }}>
                <i className="ti ti-settings" />
              </div>
            </div>
          </div>

          {/* MAIN SCROLL */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>

              {/* Profil akun */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: `0.5px solid ${itemBorder}` }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d3d6da', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${navBorder}`, flexShrink: 0, overflow: 'hidden' }}>
                  {account?.profile_picture_url
                    ? <img src={account.profile_picture_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    : <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.5 0-10.4 1.8-10.4 5.3v1.1h20.8v-1.1c0-3.5-6.9-5.3-10.4-5.3z" /></svg>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>@{account?.username ?? '—'}</div>
                  <div style={{ fontSize: 11, color: textTertiary, marginTop: 2 }}>{account?.name ?? '—'} · {account?.followers_count ?? '—'} followers</div>
                </div>
                <button onClick={() => router.push('/auth')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `0.5px solid ${navBorder}`, background: cardBg, color: textPrimary, fontSize: 11, cursor: 'pointer' }}>
                  Ganti akun
                </button>
              </div>

              <GroupLabel label="Data" />
              <SettingsItem label="Auto-refresh saat dibuka" right={<Toggle on={autoRefresh} onClick={toggleAutoRefresh} />} />
              <SettingsItem label="Terakhir diperbarui" right={<span>{formatDate(account?.updated_at ?? null)}</span>} />
              <SettingsItem label="Refresh data sekarang" right={
                <button onClick={() => router.push('/loading-data')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: `0.5px solid ${navBorder}`, background: cardBg, color: textPrimary, fontSize: 11, cursor: 'pointer' }}>
                  <i className="ti ti-refresh" style={{ fontSize: 12 }} />Refresh
                </button>
              } />

              <GroupLabel label="Tampilan" />
              <SettingsItem label="Tema" right={
                <button onClick={toggleTheme} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: `0.5px solid ${navBorder}`, background: cardBg, color: textPrimary, fontSize: 11, cursor: 'pointer' }}>
                  <i className={`ti ${isDark ? 'ti-moon' : 'ti-sun'}`} style={{ fontSize: 12 }} />
                  {isDark ? 'Dark' : 'Light'}
                </button>
              } />

              <GroupLabel label="AI" />
              <SettingsItem label="Model AI" right={<span>Gemini 2.5 Flash</span>} />
              <SettingsItem label="Bahasa output AI" right={<span>Bahasa Indonesia</span>} />

              <GroupLabel label="Tentang" />
              <SettingsItem
                label="Kebijakan Privasi"
                right={
                  <a href="/privacy" target="_blank" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-external-link" style={{ fontSize: 13 }} />
                  </a>
                }
              />
              <SettingsItem
                label="Syarat Layanan"
                right={
                  <a href="/terms" target="_blank" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-external-link" style={{ fontSize: 13 }} />
                  </a>
                }
              />

              <GroupLabel label="Akun" />
              <SettingsItem
                label={disconnecting ? 'Memutuskan koneksi...' : 'Putuskan koneksi Instagram'}
                danger
                right={
                  <button onClick={handleDisconnect} disabled={disconnecting} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: '0.5px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: 11, cursor: disconnecting ? 'not-allowed' : 'pointer', opacity: disconnecting ? 0.6 : 1 }}>
                    <i className="ti ti-unlink" style={{ fontSize: 12 }} />
                    Putuskan
                  </button>
                }
              />

              <div style={{ fontSize: 11, color: textTertiary, textAlign: 'center', marginTop: 32, paddingBottom: 24 }}>
                freehandtools · Creator Performance Intelligence Dashboard<br />
                <span style={{ fontSize: 10 }}>Data diambil langsung dari Meta Graph API</span>
              </div>
            </div>
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