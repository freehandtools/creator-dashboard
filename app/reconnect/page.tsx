'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

export default function ReconnectPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const wrapRef = useRef<HTMLDivElement>(null)
  const nebula1Ref = useRef<HTMLDivElement>(null)
  const nebula2Ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  useEffect(() => {
    const wrap = wrapRef.current
    const nebula1 = nebula1Ref.current
    const nebula2 = nebula2Ref.current
    const btn = btnRef.current
    if (!wrap || !nebula1 || !nebula2 || !btn) return
    const MAX_DIST = 350

    function onMouseMove(e: MouseEvent) {
      const wr = wrap.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      const btnCx = br.left - wr.left + br.width / 2
      const btnCy = br.top - wr.top + br.height / 2
      const dist = Math.hypot(e.clientX - wr.left - btnCx, e.clientY - wr.top - btnCy)
      const t = Math.max(0, 1 - dist / MAX_DIST)
      const max1 = theme === 'dark' ? 0.9 : 0.22
      const max2 = theme === 'dark' ? 0.7 : 0.18
      nebula1.style.opacity = (t * max1).toFixed(2)
      nebula2.style.opacity = (t * max2).toFixed(2)
      const scale = 0.85 + t * 0.3
      nebula1.style.transform = `translateX(-50%) scale(${scale})`
      nebula2.style.transform = `translateX(-50%) scale(${scale * 1.05})`
    }

    function onMouseLeave() {
      nebula1.style.opacity = '0'
      nebula2.style.opacity = '0'
    }

    wrap.addEventListener('mousemove', onMouseMove)
    wrap.addEventListener('mouseleave', onMouseLeave)
    return () => {
      wrap.removeEventListener('mousemove', onMouseMove)
      wrap.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [theme])

  const isDark = theme === 'dark'
  const bg = isDark ? '#08080f' : '#f7f7fa'
  const navBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'
  const navBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.15)'
  const textPrimary = isDark ? '#fff' : '#0a0a14'
  const textSecondary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,20,0.5)'
  const textTertiary = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,20,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,20,0.03)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.1)'
  const toggleBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.06)'
  const starColor = isDark ? '#fff' : '#888'
  const starShadow = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.15)'
  const nebulaMix = isDark ? 'normal' : 'multiply'

  return (
    <div ref={wrapRef} style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s', fontFamily: 'system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes igShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes twinkle { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes starRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* NEBULA */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1, mixBlendMode: nebulaMix as React.CSSProperties['mixBlendMode'] }}>
        <div ref={nebula1Ref} style={{ position: 'absolute', bottom: '-15%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '50%', filter: 'blur(65px)', opacity: 0, transition: 'opacity 0.25s ease, transform 0.4s ease', background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #FFD600 0%, #FF7A00 22%, #FF0069 45%, #D300C5 68%, #7638FA 90%, transparent 100%)' }} />
        <div ref={nebula2Ref} style={{ position: 'absolute', bottom: '-15%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '42%', filter: 'blur(65px)', opacity: 0, transition: 'opacity 0.25s ease, transform 0.4s ease', background: 'radial-gradient(ellipse 40% 100% at 50% 100%, #7638FA 0%, #D300C5 35%, #FF0069 65%, transparent 90%)' }} />
      </div>

      {/* STAR FIELD */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
        <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', animation: 'starRotate 240s linear infinite' }}>
          {Array.from({ length: 100 }, (_, i) => {
            const size = Math.random() < 0.85 ? Math.random() * 1.5 + 0.5 : Math.random() * 1.5 + 2
            return (
              <div key={i} style={{ position: 'absolute', borderRadius: '50%', background: starColor, width: size, height: size, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `twinkle ${(Math.random() * 3 + 2).toFixed(1)}s ease-in-out infinite`, animationDelay: `${(Math.random() * 3).toFixed(1)}s`, boxShadow: size > 2 ? `0 0 4px ${starShadow}` : 'none' }} />
            )
          })}
        </div>
      </div>

      {/* NAVBAR */}
      <div style={{ padding: '10px 12px 0', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderRadius: 12, border: `0.5px solid ${navBorder}`, backdropFilter: 'blur(16px)', background: navBg }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <FreehandLogo color={textPrimary} />
            <span style={{ fontSize: 12, fontWeight: 500, color: textPrimary }}>freehandtools</span>
          </Link>
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

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 340 }}>

          <div style={{ width: 56, height: 56, borderRadius: 16, border: `2px solid rgba(248,113,113,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(248,113,113,0.08)' }}>
            <i className="ti ti-unlink" style={{ fontSize: 26, color: '#f87171' }} />
          </div>

          <h1 style={{ fontSize: 18, fontWeight: 900, color: textPrimary, margin: '0 0 8px', letterSpacing: '-0.2px' }}>
            Sesi Instagram berakhir
          </h1>
          <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6, margin: '0 0 10px' }}>
            Token akses kamu sudah kedaluwarsa atau dicabut. Hubungkan ulang Instagram untuk melanjutkan.
          </p>
          <p style={{ fontSize: 11, color: textTertiary, margin: '0 0 28px' }}>
            Proses ini hanya butuh beberapa detik dan tidak menghapus data yang sudah tersimpan.
          </p>

          <div style={{ width: '100%', border: `0.5px solid ${cardBorder}`, borderRadius: 12, padding: '14px 16px', background: cardBg, marginBottom: 24, textAlign: 'left' }}>
            {[
              { icon: 'ti-check', color: '#4ade80', text: 'Data konten & insight tetap tersimpan' },
              { icon: 'ti-check', color: '#4ade80', text: 'Pengaturan tidak berubah' },
              { icon: 'ti-refresh', color: textSecondary, text: 'Token baru akan diambil otomatis' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: textPrimary, padding: '5px 0', borderBottom: i < 2 ? `0.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,20,0.06)'}` : 'none' }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 13, color: item.color }} />
                {item.text}
              </div>
            ))}
          </div>

          <a ref={btnRef} href="/api/auth/meta/start" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA)', backgroundSize: '200% 100%', animation: 'igShift 4s ease infinite', border: 'none', borderRadius: 22, padding: '11px 26px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', textDecoration: 'none' }}>
            <i className="ti ti-refresh" style={{ fontSize: 15 }} />
            Hubungkan Ulang Instagram
          </a>

          <p style={{ fontSize: 11, color: textTertiary, marginTop: 12 }}>Hanya akun Business / Creator yang didukung</p>
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