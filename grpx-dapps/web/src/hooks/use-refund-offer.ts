'use client'

import { OrderResource } from '@/schemas/order'
import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRefundOffer() {
  const { connection } = useConnection()
  const client = useQueryClient()
  return useMutation({
    mutationKey: ['refund-offer'],
    mutationFn: async ({ orderObj }: { orderObj: OrderResource }) => {
      alert('Refunded')
      return 'Refunded'
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: (err) => {
      console.error(err)
    },
  })
}
