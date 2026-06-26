'use client'

import { useEffect, useState } from 'react'

export default function PrivacyPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  const isDark = theme === 'dark'

  const css = {
    wrap: {
      minHeight: '100vh',
      background: isDark
        ? 'radial-gradient(ellipse 80% 70% at 50% 45%, #1c1030 0%, #0a0a14 45%, #04040a 100%)'
        : 'radial-gradient(ellipse 80% 70% at 50% 45%, #ece8f5 0%, #f5f4f8 45%, #ffffff 100%)',
      color: isDark ? '#fff' : '#0a0a14',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'background 0.3s, color 0.3s',
    } as React.CSSProperties,
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 18px',
      borderRadius: '12px',
      border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.18)'}`,
      backdropFilter: 'blur(16px)',
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
      transition: 'all 0.3s',
    } as React.CSSProperties,
    card: {
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,20,0.03)',
      border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.08)'}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px',
    } as React.CSSProperties,
    h2: {
      fontSize: '14px',
      fontWeight: 700,
      color: isDark ? '#fff' : '#0a0a14',
      marginBottom: '10px',
      marginTop: 0,
    } as React.CSSProperties,
    p: {
      fontSize: '13px',
      color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,20,0.6)',
      lineHeight: 1.7,
      margin: '0 0 8px',
    } as React.CSSProperties,
    li: {
      fontSize: '13px',
      color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,20,0.6)',
      lineHeight: 1.7,
      marginBottom: '4px',
    } as React.CSSProperties,
  }

  return (
    <>
      <title>Kebijakan Privasi — freehandtools</title>
      <div style={css.wrap}>
        {/* Navbar */}
        <div style={{ padding: '10px 12px 0', position: 'relative', zIndex: 10 }}>
          <nav style={css.nav}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 500 420" fill={isDark ? 'white' : '#0a0a14'}>
                <path d="M209.73,104.87c0,11.58-9.39,20.97-20.97,20.97h-62.92v62.92c0,11.58-9.39,20.97-20.97,20.97-11.58,0-20.97-9.39-20.97-20.97v-62.92H20.97C9.39,125.84,0,116.45,0,104.87c0-11.58,9.39-20.97,20.97-20.97h62.92V20.97C83.89,9.39,93.28,0,104.86,0c11.58,0,20.97,9.39,20.97,20.97v62.93h62.92c11.58,0,20.97,9.39,20.97,20.97Z"/>
                <path d="M440.43,356.53v10.5c0,5.79-4.69,10.48-10.48,10.48-5.79,0-10.48-4.69-10.48-10.48-0-5.79-4.7-10.49-10.49-10.49-5.79,0-10.49,4.7-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-10.49c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v10.49c0,23.17-18.78,41.94-41.94,41.94-23.17,0-41.94-18.78-41.94-41.94v-31.46c0-5.79-4.69-10.49-10.49-10.49-5.79,0-10.49,4.69-10.49,10.49v41.94c0,28.96-23.48,52.43-52.43,52.43-28.96,0-52.43-23.48-52.43-52.43v-136.32c0-11.58,9.39-20.97,20.97-20.97,11.58,0,20.97,9.39,20.97,20.97v136.32c0,5.79,4.69,10.48,10.48,10.48,5.79,0,10.48-4.69,10.48-10.48v-52.43c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94v31.46c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.95,41.95-41.95,23.17,0,41.95,18.78,41.95,41.95v10.49c0,5.79,4.69,10.49,10.49,10.49,5.79,0,10.49-4.69,10.49-10.49v-10.49c0-23.17,18.78-41.94,41.94-41.94,23.17,0,41.94,18.78,41.94,41.94Z"/>
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#fff' : '#0a0a14' }}>freehandtools</span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href="mailto:freehandtools@gmail.com?subject=Masalah%20Privacy%20Policy%20%E2%80%94%20freehandtools-dashboard.vercel.app&body=Halo%2C%20kak.%20Saat%20ini%2C%20halaman%20Privacy%20Policy%20yang%20saya%20buka%20ada%20suatu%20masalah.%20Tolong%20perbaiki%20bagian%20yang%20eror%20atau%20bermasalah.%20Terima%20kasih%20%F0%9F%99%8F"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.05)',
                  border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,20,0.18)'}`,
                  borderRadius: '8px', padding: '6px 14px', fontSize: '11px',
                  color: isDark ? '#fff' : '#0a0a14', textDecoration: 'none',
                }}
              >
                <i className="ti ti-message" style={{ fontSize: '13px' }} />
                Hubungi Kami
              </a>
              <button
                onClick={toggleTheme}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,20,0.18)'}`,
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,20,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: isDark ? '#fff' : '#0a0a14', fontSize: '16px',
                  flexShrink: 0,
                }}
              >
                <i className={isDark ? 'ti ti-moon' : 'ti ti-sun'} />
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px 60px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: isDark ? 'rgba(118,56,250,0.15)' : 'rgba(118,56,250,0.08)',
              border: `0.5px solid ${isDark ? 'rgba(118,56,250,0.35)' : 'rgba(118,56,250,0.25)'}`,
              borderRadius: '20px', padding: '4px 12px', fontSize: '11px',
              color: isDark ? '#c4b0ff' : '#7638FA', marginBottom: '16px',
            }}>
              <i className="ti ti-shield-lock" style={{ fontSize: '12px' }} />
              Kebijakan Privasi
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.3px', color: isDark ? '#fff' : '#0a0a14' }}>
              Kebijakan Privasi
            </h1>
            <p style={{ ...css.p, margin: 0 }}>
              Terakhir diperbarui: Juni 2025 &nbsp;·&nbsp; Berlaku untuk layanan freehandtools di domain{' '}
              <span style={{ color: isDark ? '#c4b0ff' : '#7638FA' }}>freehandtools-dashboard.vercel.app</span>
            </p>
          </div>

          {/* Sections */}
          <div style={css.card}>
            <h2 style={css.h2}>1. Informasi yang Kami Kumpulkan</h2>
            <p style={css.p}>
              Saat kamu menghubungkan akun Instagram melalui layanan kami, kami mengumpulkan data berikut dari Meta (Facebook/Instagram) sesuai izin yang kamu berikan:
            </p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}>Informasi profil Instagram: username, foto profil, jumlah followers, jumlah media</li>
              <li style={css.li}>Data konten (media): caption, jenis konten, URL media, tanggal posting, jumlah likes dan komentar</li>
              <li style={css.li}>Data insight: reach, impressions, saves, shares (sesuai ketersediaan dari API Meta)</li>
              <li style={css.li}>Token akses (access token) yang diperlukan untuk mengambil data dari Meta Graph API</li>
            </ul>
            <p style={css.p}>Kami <strong>tidak</strong> mengumpulkan password Instagram atau Facebook kamu.</p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>2. Cara Kami Menggunakan Data</h2>
            <p style={css.p}>Data yang dikumpulkan digunakan semata-mata untuk:</p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}>Menampilkan dashboard analytics performa konten Instagram kamu</li>
              <li style={css.li}>Menghasilkan insight otomatis menggunakan AI (Google Gemini) berdasarkan data kontenmu</li>
              <li style={css.li}>Menyimpan snapshot data harian untuk menampilkan tren pertumbuhan dari waktu ke waktu</li>
            </ul>
            <p style={css.p}>
              Kami <strong>tidak</strong> menjual, menyewakan, atau membagikan data pribadimu kepada pihak ketiga untuk keperluan komersial.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>3. Penyimpanan Data</h2>
            <p style={css.p}>
              Data disimpan di database Supabase yang berlokasi di wilayah Singapore (ap-southeast-1). Token akses disimpan dalam bentuk terenkripsi dan hanya digunakan untuk keperluan pengambilan data dari Meta API atas permintaanmu.
            </p>
            <p style={css.p}>
              Sesi login dikelola melalui HTTP-only cookie yang tidak dapat diakses oleh JavaScript pihak ketiga.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>4. Berbagi Data dengan Pihak Ketiga</h2>
            <p style={css.p}>Layanan kami menggunakan pihak ketiga berikut dalam operasionalnya:</p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}><strong>Meta (Facebook/Instagram)</strong> — sumber data melalui Instagram Graph API</li>
              <li style={css.li}><strong>Supabase</strong> — penyimpanan database</li>
              <li style={css.li}><strong>Vercel</strong> — platform hosting aplikasi</li>
              <li style={css.li}><strong>Google Gemini AI</strong> — pemrosesan AI Insights (data dikirim sebagai prompt teks tanpa informasi identitas pribadi)</li>
            </ul>
            <p style={css.p}>Setiap pihak ketiga tunduk pada kebijakan privasi masing-masing.</p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>5. Hak Pengguna & Penghapusan Data</h2>
            <p style={css.p}>Kamu berhak untuk:</p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}>Memutus koneksi Instagram kapan saja melalui menu Pengaturan di dalam dashboard</li>
              <li style={css.li}>Meminta penghapusan seluruh data akunmu dari sistem kami</li>
            </ul>
            <p style={css.p}>
              Untuk permintaan penghapusan data, kirim email ke{' '}
              <a href="mailto:freehandtools@gmail.com" style={{ color: isDark ? '#c4b0ff' : '#7638FA' }}>
                freehandtools@gmail.com
              </a>{' '}
              dengan subjek <em>&ldquo;Hapus Data — [username Instagram kamu]&rdquo;</em>.
            </p>
            <p style={css.p}>
              Kamu juga dapat mencabut izin aplikasi langsung dari pengaturan akun Meta di:{' '}
              <a href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#c4b0ff' : '#7638FA' }}>
                facebook.com/settings → Business Integrations
              </a>
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>6. Keamanan Data</h2>
            <p style={css.p}>
              Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data kamu, termasuk enkripsi token akses, penggunaan HTTPS pada seluruh komunikasi, dan pembatasan akses database melalui Row Level Security (RLS) Supabase.
            </p>
            <p style={css.p}>
              Namun demikian, tidak ada sistem yang 100% aman. Kami tidak dapat menjamin keamanan absolut dari data yang ditransmisikan melalui internet.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>7. Perubahan Kebijakan</h2>
            <p style={css.p}>
              Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan akan ditandai dengan pembaruan tanggal &ldquo;Terakhir diperbarui&rdquo; di bagian atas halaman ini. Penggunaan layanan setelah perubahan diterbitkan dianggap sebagai persetujuanmu terhadap kebijakan yang diperbarui.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>8. Kontak</h2>
            <p style={{ ...css.p, margin: 0 }}>
              Pertanyaan terkait kebijakan privasi ini dapat diajukan ke:{' '}
              <a href="mailto:freehandtools@gmail.com" style={{ color: isDark ? '#c4b0ff' : '#7638FA' }}>
                freehandtools@gmail.com
              </a>
            </p>
          </div>

          <p style={{ ...css.p, textAlign: 'center', marginTop: '24px', fontSize: '11px' }}>
            <a href="/" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.4)', textDecoration: 'none', marginRight: '16px' }}>← Kembali ke Beranda</a>
            <a href="/terms" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.4)', textDecoration: 'none' }}>Syarat Layanan →</a>
          </p>
        </div>
      </div>
    </>
  )
}
