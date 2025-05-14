import { useTheme } from 'next-themes'
import React from 'react'

export function AppFooter() {
  const { theme } = useTheme()
  return (
    <footer className={`text-center p-2 text-xs  text-primary bg-neutral-100 dark:bg-neutral-900`}>
      Developed by{' '}
      <a
        className="link hover:text-neutral-500 dark:hover:text-white font-semibold"
        href="https://github.com/pyronlaboratory"
        target="_blank"
        rel="noopener noreferrer"
      >
        @pyronlaboratory
      </a>
    </footer>
  )
}
