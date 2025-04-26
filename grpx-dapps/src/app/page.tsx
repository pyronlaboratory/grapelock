'use client'
import AppLanding from '@/components/app-landing'
import { useWallet } from '@solana/wallet-adapter-react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { publicKey } = useWallet()
  useEffect(() => {
    if (publicKey) {
      redirect('/marketplace/collections')
    }
  }, [publicKey])
  return <AppLanding />
}
