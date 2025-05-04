'use client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { useWallet } from '@solana/wallet-adapter-react'
import { redirect, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ConnectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { publicKey } = useWallet()
  const pathname = usePathname()

  useEffect(() => {
    if (!publicKey) {
      redirect('/')
    }
  }, [publicKey, pathname])

  return <DashboardLayout>{children}</DashboardLayout>
}
