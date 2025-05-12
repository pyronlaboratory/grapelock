import api from '@/lib/api'
import { allOpenVerifiedOffersResponseSchema } from '@/schemas/offer'
import { useQuery } from '@tanstack/react-query'

export const useOffers = () => {
  return useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const response = await api<any>('offers')
      const parsed = allOpenVerifiedOffersResponseSchema.parse(response)

      if (!parsed.success) {
        throw new Error('Failed to parse offers response')
      }

      return parsed.data.data
    },
    staleTime: 60_000,
    retry: false,
  })
}
