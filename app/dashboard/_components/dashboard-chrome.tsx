'use client'

import Link from 'next/link'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useTheme } from '../../_components/use-theme'

export type DashboardPage = 'overview' | 'content' | 'stats' | 'audience' | 'ai' | 'settings'
export const useDashboardTheme = useTheme

const SIDEBAR_ITEMS: Array<{
  id: DashboardPage
  icon: string
  href: string
  label: string
}> = [
  { id: 'overview', icon: 'ti-layout-dashboard', href: '/dashboard', label: 'Overview' },
  { id: 'content', icon: 'ti-photo', href: '/dashboard/content', label: 'Konten' },
  { id: 'stats', icon: 'ti-chart-bar', href: '/dashboard/stats', label: 'Statistik & Tren' },
  { id: 'audience', icon: 'ti-users', href: '/dashboard/audience', label: 'Audiens' },
  { id: 'ai', icon: 'ti-bulb', href: '/dashboard/ai', label: 'AI Insight' },
  { id: 'settings', icon: 'ti-settings', href: '/dashboard/settings', label: 'Pengaturan' },
]

export function DashboardTopbar({
  title,
  isDark,
  leading,
  actions,
}: {
  title: string
  isDark: boolean
  leading?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header
      className="dashboard-topbar"
      style={{
        borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.08)',
        color: isDark ? '#fff' : '#0a0a14',
      }}
    >
      <div className="dashboard-topbar-heading">
        {leading}
        <h1 className="dashboard-topbar-title">{title}</h1>
      </div>
      {actions ? <div className="dashboard-topbar-actions">{actions}</div> : null}
    </header>
  )
}

export function DashboardBody({
  activePage,
  isDark,
  children,
}: {
  activePage: DashboardPage
  isDark: boolean
  children: ReactNode
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className={`dashboard-body${sidebarExpanded ? ' is-sidebar-expanded' : ''}`}>
      <DashboardSidebar
        activePage={activePage}
        isDark={isDark}
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />
      <main className="dashboard-main">{children}</main>
    </div>
  )
}

export function DashboardSidebar({
  activePage,
  isDark,
  expanded,
  onExpandedChange,
}: {
  activePage: DashboardPage
  isDark: boolean
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}) {
  return (
    <aside
      className="dashboard-sidebar"
      aria-label="Navigasi dashboard"
      data-expanded={expanded ? 'true' : 'false'}
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={() => onExpandedChange(false)}
      onFocusCapture={() => onExpandedChange(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onExpandedChange(false)
        }
      }}
      style={{
        borderRightColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,20,0.08)',
        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,20,0.4)',
        '--dashboard-sidebar-hover-background': isDark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,20,0.05)',
        '--dashboard-sidebar-hover-color': isDark ? 'rgba(255,255,255,0.72)' : 'rgba(10,10,20,0.72)',
        '--dashboard-sidebar-active-label': isDark ? '#fff' : '#0a0a14',
      } as CSSProperties}
    >
      {SIDEBAR_ITEMS.map((item, index) => {
        const active = item.id === activePage
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`dashboard-sidebar-link${item.id === 'settings' ? ' dashboard-sidebar-settings' : ''}`}
            aria-current={active ? 'page' : undefined}
            title={item.label}
            style={{
              '--dashboard-sidebar-open-delay': `${70 + index * 20}ms`,
              '--dashboard-sidebar-close-delay': `${(SIDEBAR_ITEMS.length - index - 1) * 10}ms`,
            } as CSSProperties}
          >
            <span className="dashboard-sidebar-item">
              <span className={`dashboard-sidebar-icon${active ? ' is-active' : ''}`} aria-hidden="true">
                <i className={`ti ${item.icon}`} />
              </span>
              <span className="dashboard-sidebar-label">{item.label}</span>
            </span>
          </Link>
        )
      })}
    </aside>
  )
}
