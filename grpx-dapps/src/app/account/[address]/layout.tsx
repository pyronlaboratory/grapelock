// src/app/account/layout.tsx
import React from 'react'
import { GeistSans } from 'geist/font/sans'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={` ${GeistSans.className}`}>
        <div className="min-h-screen flex items-center justify-center">{children}</div>
      </body>
    </html>
  )
}
