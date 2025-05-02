'use client'

import { useQuery } from '@tanstack/react-query'
import { collectionsResponseSchema } from '@/schemas/collection'
import api from '@/lib/api'

export function useGetCollections(publicKey: string) {
  return useQuery({
    queryKey: ['get-collections', publicKey],
    queryFn: async () => {
      const response = await api(`collections/${publicKey}`)
      const parsed = collectionsResponseSchema.parse(response)
      return parsed.data
    },
    enabled: !!publicKey,
    staleTime: 60_000,
  })
}
