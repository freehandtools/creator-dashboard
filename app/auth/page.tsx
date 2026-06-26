'use client'

import { useEffect, useRef, useState } from 'react'

export default function AuthPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const wrapRef = useRef<HTMLDivElement>(null)
  const fbBtnRef = useRef<HTMLButtonElement>(null)
  const fbShineRef = useRef<HTMLDivElement>(null)
  const nebula1Ref = useRef<HTMLDivElement>(null)
  const nebula2Ref = useRef<HTMLDivElement>(null)
  const starFieldRef = useRef<HTMLDivElement>(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    const sf = starFieldRef.current
    if (!sf) return
    sf.innerHTML = ''
    for (let i = 0; i < 120; i++) {
      const star = document.createElement('div')
      const size = Math.random() < 0.85 ? Math.random() * 1.5 + 0.5 : Math.random() * 1.5 + 2
      star.style.cssText = `position:absolute;border-radius:50%;background:${isDark ? '#fff' : '#888'};width:${size}px;height:${size}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation:twinkle ${(Math.random() * 3 + 2).toFixed(1)}s ease-in-out infinite;animation-delay:${(Math.random() * 3).toFixed(1)}s;${size > 2 ? `box-shadow:0 0 4px ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.15)'}` : ''}`
      sf.appendChild(star)
    }
  }, [theme])

  function handleMouseMove(e: React.MouseEvent) {
    const wrap = wrapRef.current
    const fbBtn = fbBtnRef.current
    const fbShine = fbShineRef.current
    const nebula1 = nebula1Ref.current
    const nebula2 = nebula2Ref.current
    if (!wrap || !fbBtn || !fbShine || !nebula1 || !nebula2) return

    const r = wrap.getBoundingClientRect()
    const br = fbBtn.getBoundingClientRect()
    const btnCx = br.left - r.left + br.width / 2
    const btnCy = br.top - r.top + br.height / 2
    const mx = e.clientX - r.left
    const my = e.clientY - r.top

    const dist = Math.hypot(mx - btnCx, my - btnCy)
    const t = Math.max(0, 1 - Math.min(dist / 350, 1))

    const maxOp1 = isDark ? 0.9 : 0.25
    const maxOp2 = isDark ? 0.7 : 0.18
    nebula1.style.opacity = (t * maxOp1).toFixed(2)
    nebula2.style.opacity = (t * maxOp2).toFixed(2)
    const scale = 0.85 + t * 0.3
    nebula1.style.transform = `translateX(-50%) scale(${scale})`
    nebula2.style.transform = `translateX(-50%) scale(${scale * 1.05})`

    const inside = e.clientX >= br.left && e.clientX <= br.right && e.clientY >= br.top && e.clientY <= br.bottom
    if (inside) {
      fbBtn.style.setProperty('--bx', ((e.clientX - br.left) / br.width * 100).toFixed(0) + '%')
      fbBtn.style.setProperty('--by', ((e.clientY - br.top) / br.height * 100).toFixed(0) + '%')
      fbShine.style.opacity = '1'
    } else {
      fbShine.style.opacity = '0'
    }
  }

  function handleMouseLeave() {
    if (nebula1Ref.current) nebula1Ref.current.style.opacity = '0'
    if (nebula2Ref.current) nebula2Ref.current.style.opacity = '0'
    if (fbShineRef.current) fbShineRef.current.style.opacity = '0'
  }

  function handleConnect() {
    window.location.href = '/api/auth/meta/start'
  }

  const bg = isDark ? '#08080f' : '#f7f7fa'
  const radial1 = isDark ? '#1c1030' : '#ece8f5'
  const radial2 = isDark ? '#0a0a14' : '#f5f4f8'
  const radial3 = isDark ? '#04040a' : '#ffffff'
  const borderStrong = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.18)'
  const navBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,20,0.03)'
  const textPrimary = isDark ? '#fff' : '#0a0a14'
  const textSecondary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,20,0.5)'
  const textTertiary = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(10,10,20,0.3)'
  const stepBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.1)'
  const stepBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(10,10,20,0.02)'
  const stepText = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,20,0.6)'
  const stepDotBorder = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,20,0.25)'
  const stepDotColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,10,20,0.4)'
  const iconBorder = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,20,0.15)'
  const iconBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,20,0.03)'

  return (
    <>
      <title>Hubungkan Instagram — Creator Performance Intelligence Dashboard</title>
      <style>{`
        @keyframes starRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes twinkle { 0%,100%{opacity:0.25} 50%{opacity:1} }
        #star-field-auth { position:absolute;width:200%;height:200%;top:-50%;left:-50%;animation:starRotate 240s linear infinite;pointer-events:none;z-index:8; }
        .nebula-auth { position:absolute;bottom:-15%;left:50%;transform:translateX(-50%);width:140%;height:50%;filter:blur(65px);pointer-events:none;transition:opacity 0.25s ease,transform 0.4s ease;opacity:0; }
      `}</style>

      <div
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ height: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', background: bg, transition: 'background 0.4s' }}
      >
        {/* BG */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${radial1} 0%, ${radial2} 45%, ${radial3} 100%)`, zIndex: 0, transition: 'background 0.4s' }} />

        {/* Nebula */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none', mixBlendMode: isDark ? 'normal' : 'multiply' }}>
          <div ref={nebula1Ref} className="nebula-auth" style={{ background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #FFD600 0%, #FF7A00 22%, #FF0069 45%, #D300C5 68%, #7638FA 90%, transparent 100%)' }} />
          <div ref={nebula2Ref} className="nebula-auth" style={{ height: '42%', background: 'radial-gradient(ellipse 40% 100% at 50% 100%, #7638FA 0%, #D300C5 35%, #FF0069 65%, transparent 90%)' }} />
        </div>

        {/* Stars */}
        <div ref={starFieldRef} id="star-field-auth" />

        {/* NAVBAR */}
        <div style={{ padding: '10px 12px 0', position: 'relative', zIndex: 10, flexShrink: 0 }}>
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderRadius: 12, border: `0.5px solid ${borderStrong}`, backdropFilter: 'blur(16px)', background: navBg, transition: 'all 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="15" height="15" viewBox="0 0 500 420" fill={textPrimary} style={{ transition: 'fill 0.3s' }}>
                <path d="M209.73,104.87c0,11.58-9.39,20.97-20.97,20.97h-62.92v62.92c0,11.58-9.39,20.97-20.97,20.97-11.58,0-20.97-9.39-20.97-20.97v-62.92H20.97C9.39,125.84,0,116.45,0,104.87c0-11.58,9.39-20.97,20.97-20.97h62.92V20.97C83.89,9.39,93.28,0,104.86,0c11.58,0,20.97,9.39,20.97,20.97v62.93h62.92c11.58,0,20.97,9.39,20.97,20.97Z"/>
                <path d="M440.43,356.53v10.5c0,5.79-4.69,10.48-10.48,10.48-5.79,0-10.48-4.69-10.48-10.48-0-5.79-4.7-10.49-10.49-10.49-5.79,0-10.49,4.7-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-10.49c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-31.46c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v41.94c0,28.96-23.48,52.43-52.43,52.43-28.96,0-52.43-23.48-52.43-52.43v-136.32c0-11.58,9.39-20.97,20.97-20.97,11.58,0,20.97,9.39,20.97,20.97v136.32c0,5.79,4.69,10.48,10.48,10.48,5.79,0,10.48-4.69,10.48-10.48v-52.43c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94v31.46c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.95,41.95-41.95,23.17,0,41.95,18.78,41.95,41.95v10.49c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94Z"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: textPrimary, transition: 'color 0.3s' }}>freehandtools</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32 }}>
              <a href="mailto:freehandtools@gmail.com?subject=Masalah%20Auth%20Page%20—%20freehandtools-dashboard.vercel.app&body=Halo%2C%20kak.%20Saat%20ini%2C%20halaman%20Auth%20yang%20saya%20buka%20ada%20suatu%20masalah.%20Tolong%20perbaiki%20bagian%20yang%20eror%20atau%20bermasalah.%20Terima%20kasih%20%F0%9F%99%8F" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, boxSizing: 'border-box', background: cardBg, border: `0.5px solid ${borderStrong}`, borderRadius: 8, padding: '0 14px', fontSize: 11, color: textPrimary, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.3s' }}>
                <i className="ti ti-message" style={{ fontSize: 13 }} /> Hubungi Kami
              </a>
              <button onClick={() => setTheme(isDark ? 'light' : 'dark')} style={{ width: 32, height: 32, boxSizing: 'border-box', borderRadius: 8, border: `0.5px solid ${borderStrong}`, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: textPrimary, fontSize: 16, transition: 'all 0.2s' }}>
                <i className={isDark ? 'ti ti-moon' : 'ti ti-sun'} />
              </button>
            </div>
          </nav>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 5 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 340, width: '100%' }}>

            {/* Icon */}
            <div style={{ width: 56, height: 56, borderRadius: 16, border: `2px solid ${iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: iconBg, transition: 'all 0.3s' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill={textPrimary}>
                <path d="M12 2.982c2.937 0 3.285.011 4.445.064a6.087 6.087 0 0 1 2.042.379 3.408 3.408 0 0 1 1.265.823 3.408 3.408 0 0 1 .823 1.265 6.087 6.087 0 0 1 .379 2.042c.053 1.16.064 1.508.064 4.445s-.011 3.285-.064 4.445a6.087 6.087 0 0 1-.379 2.042 3.643 3.643 0 0 1-2.088 2.088 6.087 6.087 0 0 1-2.042.379c-1.16.053-1.508.064-4.445.064s-3.285-.011-4.445-.064a6.087 6.087 0 0 1-2.043-.379 3.408 3.408 0 0 1-1.264-.823 3.408 3.408 0 0 1-.823-1.265 6.087 6.087 0 0 1-.379-2.042c-.053-1.16-.064-1.508-.064-4.445s.011-3.285.064-4.445a6.087 6.087 0 0 1 .379-2.042 3.408 3.408 0 0 1 .823-1.265 3.408 3.408 0 0 1 1.265-.823 6.087 6.087 0 0 1 2.042-.379c1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066a8.074 8.074 0 0 0-2.67.511 5.392 5.392 0 0 0-1.949 1.27 5.392 5.392 0 0 0-1.269 1.948 8.074 8.074 0 0 0-.51 2.67C1.012 8.638 1 9.013 1 12s.013 3.362.066 4.535a8.074 8.074 0 0 0 .511 2.67 5.392 5.392 0 0 0 1.27 1.949 5.392 5.392 0 0 0 1.948 1.269 8.074 8.074 0 0 0 2.67.51C8.638 22.988 9.013 23 12 23s3.362-.013 4.535-.066a8.074 8.074 0 0 0 2.67-.511 5.625 5.625 0 0 0 3.218-3.218 8.074 8.074 0 0 0 .51-2.67C22.988 15.362 23 14.987 23 12s-.013-3.362-.066-4.535a8.074 8.074 0 0 0-.511-2.67 5.392 5.392 0 0 0-1.27-1.949 5.392 5.392 0 0 0-1.948-1.269 8.074 8.074 0 0 0-2.67-.51C15.362 1.012 14.987 1 12 1Zm0 5.351A5.649 5.649 0 1 0 17.649 12 5.649 5.649 0 0 0 12 6.351Zm0 9.316A3.667 3.667 0 1 1 15.667 12 3.667 3.667 0 0 1 12 15.667Zm5.872-10.859a1.32 1.32 0 1 0 1.32 1.32 1.32 1.32 0 0 0-1.32-1.32Z"/>
              </svg>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 900, color: textPrimary, margin: '0 0 8px', letterSpacing: '-0.3px', transition: 'color 0.3s' }}>Hubungkan Instagram</h1>
            <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6, margin: '0 0 24px', transition: 'color 0.3s' }}>
              Kamu akan diarahkan ke Facebook untuk memberi izin baca insight. Kami tidak menyimpan password Instagram kamu.
            </p>

            {/* Steps */}
            <div style={{ width: '100%', border: `0.5px solid ${stepBorder}`, borderRadius: 12, padding: '18px 18px 6px', background: stepBg, backdropFilter: 'blur(8px)', marginBottom: 22, transition: 'all 0.3s' }}>
              {[
                { done: true, label: 'Login ke akun Facebook' },
                { done: false, label: 'Pilih Facebook Page yang terhubung ke Instagram', num: '2' },
                { done: false, label: 'Pilih akun Instagram', num: '3' },
                { done: false, label: 'Setujui izin baca insight (hanya baca)', num: '4', last: true },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: s.last ? 18 : 12 }}>
                  <div style={{ width: 22, height: 22, border: s.done ? 'none' : `1.5px solid ${stepDotBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: s.done ? '#08080f' : stepDotColor, background: s.done ? '#4ade80' : 'transparent', flexShrink: 0, transition: 'all 0.3s' }}>
                    {s.done ? <i className="ti ti-check" /> : s.num}
                  </div>
                  <div style={{ fontSize: 12, color: stepText, textAlign: 'left', lineHeight: 1.5, paddingTop: 2, transition: 'color 0.3s' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* FB Button */}
            <button
              ref={fbBtnRef}
              onClick={handleConnect}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0866ff', border: 'none', borderRadius: 22, padding: '11px 26px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Lanjutkan ke Facebook
              <div ref={fbShineRef} style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at var(--bx,50%) var(--by,50%),rgba(255,255,255,0.3),transparent 60%)', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none', borderRadius: 22 }} />
            </button>

            <p style={{ fontSize: 10, color: textTertiary, marginTop: 12, transition: 'color 0.3s' }}>Hanya akun Business / Creator yang didukung</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '8px', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6, }}>
              Dengan melanjutkan, kamu menyetujui{' '}
              <a href="/terms" target="_blank" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>
                Syarat Layanan
              </a>
              {' '}dan{' '}
              <a href="/privacy" target="_blank" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>
                Kebijakan Privasi
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}