'use client'

import { NFTCollectionManager } from '@/components/nft/nft-collection-manager'
import { useGetCollections } from '@/components/nft/nft-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'
import Loading from '../loading'

export default function ManagerPage() {
  const { publicKey } = useWallet()
  const publicKeyString = useMemo(() => publicKey?.toBase58(), [publicKey])
  const { data: collections, isLoading } = useGetCollections(publicKeyString!)

  return (
    <>
      {isLoading && <Loading />}
      {collections && <NFTCollectionManager collections={collections} />}
    </>
  )
}
