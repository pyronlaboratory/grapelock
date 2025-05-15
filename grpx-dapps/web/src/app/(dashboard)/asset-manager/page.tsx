'use client'
import { NFTCollectionManager } from '@/components/nft/nft-collection-manager'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'

export default function AssetManagerPage() {
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
  return <NFTCollectionManager address={address} />
}
