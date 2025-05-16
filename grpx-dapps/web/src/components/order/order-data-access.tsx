import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export function useGetOrders(publicKey?: string) {
  return useQuery({
    queryKey: ['orders', publicKey],
    queryFn: async () => {
      const response = await api<any>(`orders/${publicKey}`)
      return response.data
    },
    staleTime: 60_000,
    retry: false,
  })
}
