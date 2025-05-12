import { OfferResource } from '@/schemas/offer'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
function sleep(ms: number | undefined) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
export function useAcceptOffer() {
  const { connection } = useConnection()
  const client = useQueryClient()
  const wallet = useWallet()

  return useMutation({
    mutationKey: ['accept-offer'],
    mutationFn: async () => {
      await sleep(1000)
      return console.log('ok')
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: (err) => {
      console.error(err)
    },
  })
}
