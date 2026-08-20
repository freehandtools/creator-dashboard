'use client'

import { useCallback, useSyncExternalStore, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'dark' | 'light'

const THEME_CHANGE_EVENT = 'theme-change'
const THEME_REVEAL_DURATION = 700
const THEME_REVEAL_REDUCED_DURATION = 450
const THEME_REVEAL_EASING = 'cubic-bezier(0.3, 0, 0, 1)'

function readTheme(): Theme {
  return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'dark')

  const toggleTheme = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (document.documentElement.dataset.themeTransitioning === 'true') return

    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    const rect = event.currentTarget.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2
    const radius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    )
    const applyTheme = () => {
      flushSync(() => {
        localStorage.setItem('theme', nextTheme)
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
      })
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealDuration = reduceMotion
      ? THEME_REVEAL_REDUCED_DURATION
      : THEME_REVEAL_DURATION

    if (typeof document.startViewTransition !== 'function') {
      const reveal = document.createElement('span')
      reveal.className = 'dashboard-theme-reveal-fallback'
      reveal.style.setProperty('--dashboard-theme-fallback-origin-x', `${originX}px`)
      reveal.style.setProperty('--dashboard-theme-fallback-origin-y', `${originY}px`)
      reveal.style.background = theme === 'dark' ? '#08080f' : '#f7f7fa'
      document.body.appendChild(reveal)

      document.documentElement.dataset.themeTransitioning = 'true'
      applyTheme()

      let fallbackTimeout = 0
      const cleanUpFallback = () => {
        window.clearTimeout(fallbackTimeout)
        reveal.remove()
        delete document.documentElement.dataset.themeTransitioning
      }

      reveal.addEventListener('transitionend', cleanUpFallback, { once: true })
      fallbackTimeout = window.setTimeout(cleanUpFallback, 1000)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          reveal.style.setProperty('--dashboard-theme-fallback-radius', `${radius}px`)
        })
      })
      return
    }

    document.documentElement.dataset.themeTransitioning = 'true'
    document.documentElement.style.setProperty('--dashboard-theme-origin-x', `${originX}px`)
    document.documentElement.style.setProperty('--dashboard-theme-origin-y', `${originY}px`)
    document.documentElement.style.setProperty('--dashboard-theme-radius', `${radius}px`)
    const transition = document.startViewTransition(applyTheme)

    transition.ready
      .then(() => {
        const revealAnimation = document.documentElement.animate(
          [
            { clipPath: `circle(0px at ${originX}px ${originY}px)` },
            { clipPath: `circle(${radius}px at ${originX}px ${originY}px)` },
          ],
          {
            duration: revealDuration,
            easing: THEME_REVEAL_EASING,
            fill: 'both',
            pseudoElement: '::view-transition-new(root)',
          },
        )
        return revealAnimation.finished
      })
      .catch(() => {
        document.documentElement.dataset.themeAnimationFallback = 'true'
      })

    transition.finished.finally(() => {
      delete document.documentElement.dataset.themeTransitioning
      delete document.documentElement.dataset.themeAnimationFallback
      document.documentElement.style.removeProperty('--dashboard-theme-origin-x')
      document.documentElement.style.removeProperty('--dashboard-theme-origin-y')
      document.documentElement.style.removeProperty('--dashboard-theme-radius')
    })
  }, [theme])

  return { theme, isDark: theme === 'dark', toggleTheme }
}
