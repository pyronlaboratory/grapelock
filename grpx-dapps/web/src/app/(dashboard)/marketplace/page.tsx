// app/marketplace/page.tsx
'use client'

import { useGetOffers } from '@/components/marketplace/marketplace-data-access'
import { OffersList } from '@/components/marketplace/marketplace-ui'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Loading from '../loading'
import ErrorScreen from '../loading'
export default function MarketplacePage() {
  const { data: offers, isLoading, error } = useGetOffers()

  return (
    <div className="p-8">
      {isLoading && <Loading />}
      {error && <ErrorScreen />}
      {offers && <OffersList offers={offers} />}
    </div>
  )
}
