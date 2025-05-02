'use client'

import { GetStarted } from '@/components/nft/nft-ui'
import { NFTCollectionManager } from '@/components/nft/nft-collection-manager'
import { useGetCollections } from '@/components/nft/nft-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'
import ErrorScreen from '../../error'
import Loading from '../../loading'

export default function ManagerPage() {
  const { publicKey } = useWallet()
  const publicKeyString = useMemo(() => publicKey?.toBase58(), [publicKey])
  const { data: collections, isLoading, isError } = useGetCollections(publicKeyString!)

  if (isLoading) return <Loading />
  if (isError) return <ErrorScreen />
  return !collections || collections.length === 0 ? <GetStarted /> : <NFTCollectionManager collections={collections} />
}
