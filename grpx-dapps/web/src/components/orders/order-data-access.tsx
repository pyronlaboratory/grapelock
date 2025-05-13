import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export function useGetOrders(publicKey?: string) {
  return useQuery({
    queryKey: ['orders', publicKey],
    queryFn: async () => {
      const response = await api<any>(`orders/${publicKey}`)
      return response.data
      //   const parsed = allOpenVerifiedOffersResponseSchema.parse(response)

      //   if (!parsed.success) {
      //     throw new Error('Failed to parse offers response')
      //   }

      //   return parsed.data.data
    },
    staleTime: 60_000,
    retry: false,
  })
}
