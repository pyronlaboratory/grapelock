'use client'

import React from 'react'
import { ReactQueryProvider } from './react-query-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { ClusterProvider } from './cluster/cluster-data-access'
import { SolanaProvider } from '@/components/solana/solana-provider'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ClusterProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </ClusterProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
