'use client'
import { useState } from 'react'
import { CollectionType } from '@/schemas/collection'
import { CreateCollectionModal } from './nft-ui'
import { CollectionDetails } from './nft-collection-details'
import { mockNFTs } from '@/lib/mocks'
import { CollectionTable } from './data-table/nft-collection-table'

interface NFTCollectionManagerProps {
  collections: CollectionType[]
}

export function NFTCollectionManager({ collections }: NFTCollectionManagerProps) {
  const [selectedCollection, setSelectedCollection] = useState<CollectionType | null>(null)

  const getNFTsForCollection = (collectionId: string) => {
    return mockNFTs[collectionId] || []
  }

  const handleViewCollection = (collection: CollectionType) => {
    setSelectedCollection(collection)
    window.scrollTo(0, 0)
  }

  const handleBackToCollections = () => {
    setSelectedCollection(null)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary">Collections Manager</h1>

      {/* consider adding separate views */}
      {selectedCollection ? (
        <CollectionDetails
          collection={selectedCollection!}
          nfts={getNFTsForCollection(selectedCollection!?._id)}
          onBack={handleBackToCollections}
        />
      ) : (
        <div className="relative">
          <div className="absolute -top-16 right-0 rounded-xl">
            <CreateCollectionModal classes="bg-accent text-neutral-400 hover:bg-primary-foreground hover:text-primary px-6 h-[36px] rounded-lg  bg-blue-600 dark:bg-sidebar-primary text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary" />
          </div>

          <CollectionTable collections={collections} onViewCollection={handleViewCollection} />
        </div>
      )}
    </div>
  )
}
