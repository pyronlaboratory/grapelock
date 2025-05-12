import { AlertCircle } from 'lucide-react'
import { CollectionResource } from '@/schemas/collection'
import { CollectionBanner, CollectionData, CollectionHeader, NFTMintingModal } from './nft-ui'

interface CollectionDetailsProps {
  collection: CollectionResource
  onBack: () => void
}

export function CollectionDetails({ collection, onBack }: CollectionDetailsProps) {
  return (
    <div className="animate-fadeIn relative">
      <div className="mb-8 flex items-center justify-between">
        <div className="absolute -top-8 right-0 rounded-xl">
          <NFTMintingModal
            data={collection._id}
            classes="bg-accent text-neutral-400 hover:bg-primary-foreground hover:text-primary px-6 h-[36px] rounded-lg  bg-blue-600 dark:bg-sidebar-primary text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary"
          />
        </div>
      </div>

      <CollectionHeader collection={collection} />
      <CollectionBanner collection={collection} />
      <CollectionData collection={collection} />

      {collection?.errorMessage && (
        <div className="flex  items-center justify-center relative border-red-800">
          <div className="w-full mt-6 px-4 py-3 bg-red-300 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800">Error Message</h3>
            <p className="mt-1 text-red-800">{collection?.errorMessage}</p>
            <AlertCircle className="absolute top-10 right-4 text-red-800" />
          </div>
        </div>
      )}
    </div>
  )
}
