'use client'
import React, { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import OrderManager from '@/components/order/order-manager'

export default function Orders() {
  const { publicKey } = useWallet()
  const address = useMemo(() => {
    if (!publicKey) return

    try {
      return new PublicKey(publicKey)
    } catch (e) {
      console.log(`Invalid public key`, e)
    }
  }, [publicKey])

  if (!address) return

  return <OrderManager address={address} />
}
