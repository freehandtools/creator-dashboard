'use client'

import { useEffect, useState } from 'react'

export default function TermsPage() {
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
      <title>Syarat Layanan — freehandtools</title>
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
                href="mailto:freehandtools@gmail.com?subject=Masalah%20Syarat%20Layanan%20%E2%80%94%20freehandtools-dashboard.vercel.app&body=Halo%2C%20kak.%20Saat%20ini%2C%20halaman%20Syarat%20Layanan%20yang%20saya%20buka%20ada%20suatu%20masalah.%20Tolong%20perbaiki%20bagian%20yang%20eror%20atau%20bermasalah.%20Terima%20kasih%20%F0%9F%99%8F"
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
              <i className="ti ti-file-text" style={{ fontSize: '12px' }} />
              Syarat Layanan
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.3px', color: isDark ? '#fff' : '#0a0a14' }}>
              Syarat Layanan
            </h1>
            <p style={{ ...css.p, margin: 0 }}>
              Terakhir diperbarui: Juni 2025 &nbsp;·&nbsp; Berlaku untuk layanan freehandtools di domain{' '}
              <span style={{ color: isDark ? '#c4b0ff' : '#7638FA' }}>freehandtools-dashboard.vercel.app</span>
            </p>
          </div>

          {/* Sections */}
          <div style={css.card}>
            <h2 style={css.h2}>1. Penerimaan Syarat</h2>
            <p style={css.p}>
              Dengan mengakses dan menggunakan layanan freehandtools (&ldquo;Layanan&rdquo;), kamu menyatakan telah membaca, memahami, dan menyetujui Syarat Layanan ini. Jika kamu tidak menyetujui syarat ini, mohon untuk tidak menggunakan Layanan.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>2. Deskripsi Layanan</h2>
            <p style={css.p}>
              freehandtools adalah layanan analytics Instagram gratis yang memungkinkan pemilik akun Instagram Business atau Creator untuk:
            </p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}>Melihat statistik dan insight performa konten Instagram mereka</li>
              <li style={css.li}>Mendapatkan analisis AI otomatis atas data konten</li>
              <li style={css.li}>Memantau pertumbuhan akun dari waktu ke waktu</li>
            </ul>
            <p style={css.p}>
              Layanan ini bersifat <em>read-only</em> — kami <strong>tidak pernah</strong> memposting, mengedit, atau menghapus konten di akun Instagram kamu.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>3. Kelayakan Pengguna</h2>
            <p style={css.p}>Untuk menggunakan Layanan, kamu harus memenuhi syarat berikut:</p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}>Memiliki akun Instagram bertipe Business atau Creator (bukan akun Personal)</li>
              <li style={css.li}>Menghubungkan akun Instagram ke Facebook Page yang kamu kelola</li>
              <li style={css.li}>Memiliki usia minimal 13 tahun, atau usia minimum yang dipersyaratkan di wilayahmu</li>
              <li style={css.li}>Memiliki otoritas untuk memberikan izin akses data akun Instagram tersebut</li>
            </ul>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>4. Izin Akses & Data</h2>
            <p style={css.p}>
              Dengan menghubungkan akun Instagram kamu, kamu memberikan izin kepada freehandtools untuk:
            </p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}>Membaca data profil, konten, dan insight akun Instagram melalui Meta Graph API</li>
              <li style={css.li}>Menyimpan data tersebut di database kami untuk keperluan tampilan dashboard</li>
              <li style={css.li}>Memproses data konten menggunakan AI untuk menghasilkan insight dan rekomendasi</li>
            </ul>
            <p style={css.p}>
              Izin ini dapat kamu cabut kapan saja melalui menu Pengaturan di dashboard, atau langsung melalui pengaturan Meta di{' '}
              <a href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#c4b0ff' : '#7638FA' }}>
                Business Integrations
              </a>.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>5. Pembatasan Penggunaan</h2>
            <p style={css.p}>Kamu dilarang untuk:</p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}>Menggunakan Layanan untuk tujuan yang melanggar hukum atau peraturan yang berlaku</li>
              <li style={css.li}>Mencoba mengakses data akun pengguna lain tanpa izin</li>
              <li style={css.li}>Melakukan reverse-engineering, scraping, atau eksploitasi teknis terhadap Layanan</li>
              <li style={css.li}>Menggunakan Layanan untuk membangun produk kompetitor tanpa izin tertulis</li>
              <li style={css.li}>Menghubungkan akun Instagram yang bukan milikmu atau yang tidak kamu kelola</li>
            </ul>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>6. Ketersediaan Layanan</h2>
            <p style={css.p}>
              Kami berupaya menjaga Layanan tetap tersedia secara konsisten, namun tidak menjamin ketersediaan 100% tanpa gangguan. Layanan dapat mengalami downtime untuk pemeliharaan, pembaruan, atau karena faktor di luar kendali kami (termasuk perubahan kebijakan Meta API).
            </p>
            <p style={css.p}>
              Kami berhak mengubah, menangguhkan, atau menghentikan Layanan kapan saja tanpa pemberitahuan sebelumnya.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>7. Batasan Tanggung Jawab</h2>
            <p style={css.p}>
              Layanan disediakan &ldquo;sebagaimana adanya&rdquo; (<em>as-is</em>) tanpa jaminan apapun. freehandtools tidak bertanggung jawab atas:
            </p>
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px', listStyleType: 'disc' }}>
              <li style={css.li}>Kerugian yang timbul akibat ketidakakuratan data yang bersumber dari Meta API</li>
              <li style={css.li}>Keputusan bisnis yang diambil berdasarkan insight atau rekomendasi AI dari Layanan</li>
              <li style={css.li}>Kehilangan data akibat penghapusan akun atau pencabutan izin akses</li>
              <li style={css.li}>Gangguan layanan akibat perubahan kebijakan Meta, Supabase, atau Vercel</li>
            </ul>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>8. Perubahan Syarat</h2>
            <p style={css.p}>
              Kami dapat memperbarui Syarat Layanan ini kapan saja. Perubahan akan ditandai dengan pembaruan tanggal &ldquo;Terakhir diperbarui&rdquo;. Penggunaan Layanan setelah perubahan diterbitkan dianggap sebagai persetujuanmu terhadap syarat yang diperbarui.
            </p>
          </div>

          <div style={css.card}>
            <h2 style={css.h2}>9. Hubungi Kami</h2>
            <p style={{ ...css.p, margin: 0 }}>
              Pertanyaan terkait Syarat Layanan ini dapat diajukan ke:{' '}
              <a href="mailto:freehandtools@gmail.com" style={{ color: isDark ? '#c4b0ff' : '#7638FA' }}>
                freehandtools@gmail.com
              </a>
            </p>
          </div>

          <p style={{ ...css.p, textAlign: 'center', marginTop: '24px', fontSize: '11px' }}>
            <a href="/privacy" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.4)', textDecoration: 'none', marginRight: '16px' }}>← Kebijakan Privasi</a>
            <a href="/" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.4)', textDecoration: 'none' }}>Kembali ke Beranda →</a>
          </p>
        </div>
      </div>
    </>
  )
}
