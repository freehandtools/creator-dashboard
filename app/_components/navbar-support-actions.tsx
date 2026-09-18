import type { CSSProperties } from 'react'

const SUPPORT_URL = 'https://lynk.id/wildanbachtiar/s/3erqxoypn3w0'
const GITHUB_URL = 'https://github.com/freehandtools/creator-dashboard'

export function NavbarSupportActions({ isDark }: { isDark: boolean }) {
  const themeStyle = {
    '--navbar-support-background': isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,20,0.03)',
    '--navbar-support-background-hover': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,20,0.07)',
    '--navbar-support-border': isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,20,0.18)',
    '--navbar-support-color': isDark ? '#fff' : '#0a0a14',
    '--navbar-support-focus': isDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,20,0.45)',
  } as CSSProperties

  return (
    <span className="navbar-support-actions-pair">
      <a
        className="navbar-support-action"
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Dukung Kami — buka halaman donasi di tab baru"
        title="Dukung Kami"
        style={themeStyle}
      >
        <i className="ti ti-heart navbar-support-action-icon" aria-hidden="true" />
        <span className="navbar-support-action-label">Dukung Kami</span>
      </a>
      <a
        className="navbar-support-action"
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Beri Star — buka repository GitHub di tab baru"
        title="Beri Star"
        style={themeStyle}
      >
        <i className="ti ti-star navbar-support-action-icon" aria-hidden="true" />
        <span className="navbar-support-action-label">Beri Star</span>
      </a>
    </span>
  )
}
