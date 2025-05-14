'use client'

import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { collectionsResponseSchema, collectionDetailsResponseSchema } from '@/schemas/collection'
import { nftDetailsResponseSchema, nftsResponseSchema } from '@/schemas/nft'

export function useGetCollections(publicKey?: string) {
  return useQuery({
    queryKey: ['get-collections', publicKey],
    queryFn: async () => {
      const response = await api(`collections/by-public-key/${publicKey}`)
      const parsed = collectionsResponseSchema.parse(response)
      return parsed.data || []
    },
    enabled: !!publicKey,
    staleTime: 60_000,
    retry: false,
  })
}

export function useGetCollection(collectionId?: string) {
  return useQuery({
    queryKey: ['get-collections', collectionId],
    queryFn: async () => {
      const response = await api(`collections/by-collection-id/${collectionId}`)
      const parsed = collectionDetailsResponseSchema.parse(response)
      return parsed.data
    },
    enabled: !!collectionId,
    staleTime: 60_000,
    retry: false,
  })
}

export function useGetNFTs(collectionId?: string) {
  return useQuery({
    queryKey: ['get-nfts', collectionId],
    queryFn: async () => {
      const response = await api(`nfts/${collectionId}`)
      const parsed = nftsResponseSchema.parse(response)
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
