'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Step = {
  label: string
  status: 'pending' | 'done' | 'loading' | 'error'
}

const INITIAL_STEPS: Step[] = [
  { label: 'Menghubungkan ke Instagram...', status: 'loading' },
  { label: 'Mengambil profil akun', status: 'pending' },
  { label: 'Mengambil daftar konten', status: 'pending' },
  { label: 'Mengambil insight per konten', status: 'pending' },
  { label: 'Menyimpan data ke database', status: 'pending' },
]

export default function LoadingDataPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [error, setError] = useState<string | null>(null)
  const [dots, setDots] = useState('.')
  const hasRun = useRef(false)

  // Animated dots
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(id)
  }, [])

  // Theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  function setStep(index: number, status: Step['status'], label?: string) {
    setSteps(prev => prev.map((s, i) =>
      i === index ? { ...s, status, ...(label ? { label } : {}) } : s
    ))
  }

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function run() {
      try {
        // Step 0 done → step 1 loading
        await delay(600)
        setStep(0, 'done', 'Terhubung ke Instagram ✓')
        setStep(1, 'loading')

        // Panggil refresh API
        const res = await fetch('/api/instagram/refresh', { method: 'GET' })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `HTTP ${res.status}`)
        }

        setStep(1, 'done', 'Profil akun berhasil diambil ✓')
        setStep(2, 'loading')
        await delay(400)
        setStep(2, 'done', 'Daftar konten berhasil diambil ✓')
        setStep(3, 'loading')
        await delay(600)
        setStep(3, 'done', 'Insight per konten berhasil diambil ✓')
        setStep(4, 'loading')
        await delay(300)
        setStep(4, 'done', 'Data berhasil disimpan ✓')

        await delay(800)
        router.push('/dashboard')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
        setError(msg)
        setSteps(prev => prev.map(s =>
          s.status === 'loading' ? { ...s, status: 'error' } : s
        ))
      }
    }

    run()
  }, [router])

  function delay(ms: number) {
    return new Promise(r => setTimeout(r, ms))
  }

  const isDark = theme === 'dark'

  const bg = isDark ? '#08080f' : '#f7f7fa'
  const navBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'
  const navBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.18)'
  const textPrimary = isDark ? '#fff' : '#0a0a14'
  const textSecondary = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,20,0.5)'
  const textTertiary = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(10,10,20,0.35)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(10,10,20,0.03)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.1)'
  const toggleBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.06)'
  const spinnerBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,20,0.12)'
  const spinnerTop = isDark ? '#fff' : '#0a0a14'

  return (
    <>
    <title>Mengambil Data — Creator Performance Intelligence Dashboard</title>
    <div style={{
      minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column',
      transition: 'background 0.3s', fontFamily: 'system-ui, sans-serif'
    }}>
    {/* Stars (dark only) */}
    {isDark && <StarField />}
      
      {/* NAVBAR */}
      <div style={{ padding: '10px 12px 0', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 18px', borderRadius: 12,
          border: `0.5px solid ${navBorder}`,
          backdropFilter: 'blur(16px)', background: navBg, transition: 'all 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <FreehandLogo color={textPrimary} />
            <span style={{ fontSize: 12, fontWeight: 500, color: textPrimary, transition: 'color 0.3s' }}>freehandtools</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href="mailto:freehandtools@gmail.com?subject=Masalah%20Loading%20Data%20—%20freehandtools-dashboard.vercel.app&body=Halo%2C%20kak.%20Saat%20ini%2C%20halaman%20Loading%20Data%20yang%20saya%20buka%20ada%20suatu%20masalah.%20Tolong%20perbaiki%20bagian%20yang%20eror%20atau%20bermasalah.%20Terima%20kasih%20%F0%9F%99%8F"
              style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, height: 32,
              background: cardBg, border: `0.5px solid ${navBorder}`, borderRadius: 8,
              padding: '0 14px', fontSize: 11, color: textPrimary, cursor: 'pointer', textDecoration: 'none'
            }}>
              <i className="ti ti-message" style={{ fontSize: 13 }} />
              Hubungi Kami
            </a>
            <button onClick={toggleTheme} style={{
              width: 32, height: 32, borderRadius: 8, border: `0.5px solid ${navBorder}`,
              background: toggleBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: textPrimary, fontSize: 16, transition: 'all 0.2s'
            }}>
              <i className={`ti ${isDark ? 'ti-moon' : 'ti-sun'}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* BODY */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', position: 'relative', zIndex: 5
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 320, width: '100%' }}>

          {error ? (
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          ) : (
            <Spinner borderColor={spinnerBorder} topColor={spinnerTop} />
          )}

          <h1 style={{ fontSize: 18, fontWeight: 900, color: textPrimary, margin: '0 0 8px', letterSpacing: '-0.2px', transition: 'color 0.3s' }}>
            {error ? 'Gagal mengambil data' : `Mengambil data dari Instagram${dots}`}
          </h1>
          <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6, margin: '0 0 22px', transition: 'color 0.3s' }}>
            {error ? error : 'Pertama kali biasanya 10–20 detik'}
          </p>

          {/* Progress steps */}
          <div style={{
            width: '100%', border: `0.5px solid ${cardBorder}`, borderRadius: 12,
            padding: '14px 16px', background: cardBg, backdropFilter: 'blur(8px)', textAlign: 'left'
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
                padding: '5px 0',
                borderBottom: i < steps.length - 1 ? `0.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.07)'}` : 'none',
                color: step.status === 'done' ? '#4ade80'
                  : step.status === 'error' ? '#f87171'
                  : step.status === 'loading' ? textPrimary
                  : textTertiary,
                transition: 'color 0.3s'
              }}>
                <i className={
                  step.status === 'done' ? 'ti ti-check' :
                  step.status === 'error' ? 'ti ti-x' :
                  step.status === 'loading' ? 'ti ti-loader-2' :
                  'ti ti-circle'
                } style={{
                  fontSize: 13,
                  animation: step.status === 'loading' ? 'spin 1s linear infinite' : undefined,
                  display: 'inline-block'
                }} />
                {step.label}
              </div>
            ))}
          </div>

          {error && (
            <button
              onClick={() => { window.location.href = '/api/auth/meta/start' }}
              style={{
                marginTop: 16, padding: '10px 22px', borderRadius: 22, border: 'none',
                background: 'linear-gradient(90deg,#FFD600,#FF7A00,#FF0069,#D300C5,#7638FA)',
                color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer'
              }}
            >
              Coba hubungkan ulang
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes twinkle { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
        @keyframes starRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
    </>
  )
}

function Spinner({ borderColor, topColor }: { borderColor: string; topColor: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', marginBottom: 20,
      border: `2.5px solid ${borderColor}`, borderTopColor: topColor,
      animation: 'spin 0.9s linear infinite'
    }} />
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

function StarField() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', animation: 'starRotate 240s linear infinite' }}>
        {Array.from({ length: 80 }, (_, i) => {
          const size = Math.random() < 0.85 ? Math.random() * 1.5 + 0.5 : Math.random() * 1.5 + 2
          return (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%', background: '#fff',
              width: size, height: size,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animation: `twinkle ${(Math.random() * 3 + 2).toFixed(1)}s ease-in-out infinite`,
              animationDelay: `${(Math.random() * 3).toFixed(1)}s`,
              boxShadow: size > 2 ? '0 0 4px rgba(255,255,255,0.8)' : 'none'
            }} />
          )
        })}
      </div>
    </div>
  )
}