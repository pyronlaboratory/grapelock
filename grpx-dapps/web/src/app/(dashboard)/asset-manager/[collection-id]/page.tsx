'use client'
import { CollectionHero, CollectionDetails } from '@/components/nft/nft-ui'
import { useGetCollectionDetails } from '@/components/nft/nft-data-access'
import { useParams } from 'next/navigation'
import ErrorScreen from '../../error'

export default function CollectionDetailsPage() {
  const params = useParams()
  const collectionId = params['collection-id'] as string
  const query = useGetCollectionDetails(collectionId)

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fadeIn relative">
      {query.isError && <ErrorScreen />}
      {query.isSuccess && (
        <div className="">
          <CollectionHero collection={query.data} />
          <CollectionDetails collection={query.data} />
        </div>
      )}
    </div>
  )
}
