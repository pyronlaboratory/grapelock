'use client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { useWallet } from '@solana/wallet-adapter-react'
import { redirect, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ConnectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { publicKey, connecting, connected } = useWallet()
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && !publicKey && !connecting && !connected) {
      redirect('/')
    }
  }, [hydrated, publicKey, connecting, connected, pathname])

  return <DashboardLayout>{children}</DashboardLayout>
}
