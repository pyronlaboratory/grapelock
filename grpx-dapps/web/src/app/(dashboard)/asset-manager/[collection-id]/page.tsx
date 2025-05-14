'use client'
import { AlertCircle } from 'lucide-react'
import { CollectionBanner, CollectionData, CollectionHeader, NFTMintingModal } from '@/components/nft/nft-ui'
import { useGetCollection } from '@/components/nft/nft-data-access'
import { useParams } from 'next/navigation'
import ErrorScreen from '../../error'

export default function CollectionDetailsPage() {
  const params = useParams()
  const collectionId = params['collection-id'] as string
  const query = useGetCollection(collectionId)

  return (
    <div className="animate-fadeIn relative">
      {query.isError && <ErrorScreen />}
      {query.isSuccess && (
        <div className="max-w-6xl mx-auto relative">
          <div className="mb-8 flex items-center justify-between">
            <div className="absolute -top-8 right-0 rounded-xl">
              <NFTMintingModal
                data={query.data._id}
                classes="bg-accent text-neutral-400 hover:bg-primary-foreground hover:text-primary px-6 h-[36px] rounded-lg  bg-blue-600 dark:bg-sidebar-primary text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary"
              />
            </div>
          </div>
          <CollectionHeader collection={query.data} />
          <CollectionBanner collection={query.data} />
          <CollectionData collection={query.data} />
        </div>
      )}
    </div>
  )
}
