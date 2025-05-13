'use client'

import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { collectionsResponseSchema } from '@/schemas/collection'
import { nftDetailsResponseSchema, nftsResponseSchema } from '@/schemas/nft'

export function useGetCollections(publicKey?: string) {
  return useQuery({
    queryKey: ['get-collections', publicKey],
    queryFn: async () => {
      const response = await api(`collections/${publicKey}`)
      const parsed = collectionsResponseSchema.parse(response)
      return parsed.data || []
    },
    enabled: !!publicKey,
    staleTime: 60_000,
    retry: false,
  })
}

export function useGetNFTs(collectionId: any | null) {
  return useQuery({
    queryKey: ['get-nfts', collectionId],
    queryFn: async () => {
      const response = await api(`nfts/${collectionId}`)
      const parsed = nftsResponseSchema.parse(response)
      // if (!parsed.success) {
      //   console.error(parsed.error.format())
      //   return []
      // }
      return parsed.data
    },
    enabled: !!collectionId,
    staleTime: 60_000,
    retry: false,
  })
}

export function useGetNFTDetails(nftId: string | null) {
  return useQuery({
    queryKey: ['get-nft-details', nftId],
    queryFn: async () => {
      const response = await api(`nfts/data/${nftId}`)
      const parsed = nftDetailsResponseSchema.parse(response)
      return parsed.data
    },
    enabled: !!nftId,
    staleTime: 60_000,
    retry: false,
  })
}
