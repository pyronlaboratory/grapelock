'use client'
import AppLanding from '@/components/app-landing'
import { useWallet } from '@solana/wallet-adapter-react'
import { redirect, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { publicKey } = useWallet()
  const pathname = usePathname()
  useEffect(() => {
    if (publicKey && pathname === '/') {
      redirect('/marketplace')
    }
  }, [publicKey])
  return <AppLanding />
}
