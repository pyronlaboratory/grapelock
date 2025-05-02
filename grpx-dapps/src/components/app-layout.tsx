'use client'

import React from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppFooter } from '@/components/app-footer'
import { ClusterChecker } from '@/components/cluster/cluster-ui'
import { AccountChecker } from '@/components/account/account-ui'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="flex flex-col min-h-screen">
        <main className="min-h-screen">
          <ClusterChecker>
            <AccountChecker />
          </ClusterChecker>
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}
