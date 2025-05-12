// app/marketplace/page.tsx
'use client'
import { useOffers } from '@/components/marketplace/marketplace-data-access'
import { OffersList } from '@/components/marketplace/marketplace-ui'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MarketplacePage() {
  const { data: offers, isLoading, error } = useOffers()

  return (
    <div className="p-8">
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 bg-zinc-800 mb-2" />
                <Skeleton className="h-4 w-1/2 bg-zinc-800 mb-4" />
                <Skeleton className="h-6 w-1/3 bg-zinc-800" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full bg-zinc-800" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {error && <div className="text-red-500">Failed to load offers</div>}

      {offers && <OffersList offers={offers} />}
    </div>
  )
}
