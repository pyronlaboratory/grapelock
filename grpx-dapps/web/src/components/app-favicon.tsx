'use client'

import { useEffect } from 'react'

export default function AppFavicon() {
  useEffect(() => {
    const icons = ['🍇', '🍷', '🍾', '🚚', '📦', '🔗', '🌍']
    let i = 0
    const interval = setInterval(() => {
      const emoji = icons[i]
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="transition: opacity 0.5s;">
          <text y=".9em" font-size="90">${emoji}</text>
        </svg>
      `
      const url = 'data:image/svg+xml,' + encodeURIComponent(svg)
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) {
        link.href = url
      }
      i = (i + 1) % icons.length
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return null
}
