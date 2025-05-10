'use client'
import { useEffect, useState } from 'react'
import { CollectionResource } from '@/schemas/collection'
import { CreateCollectionModal, GetStarted } from './nft-ui'
import { CollectionDetails } from './nft-collection-details'
import { CollectionTable } from './data-table/nft-collection-table'
import { useGetNFTs } from './nft-data-access'
import { NFTResource } from '@/schemas/nft'
interface NFTCollectionManagerProps {
  collections: CollectionResource[]
}

export function NFTCollectionManager({ collections }: NFTCollectionManagerProps) {
  const [selectedCollection, setSelectedCollection] = useState<CollectionResource | null>(null)
  const handleViewCollection = (collection: CollectionResource) => {
    setSelectedCollection(collection)
    window.scrollTo(0, 0)
  }
  const handleBackToCollections = () => {
    setSelectedCollection(null)
  }

  if (collections.length === 0) return <GetStarted />
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary">All Collections 📦</h1>
      <h1 className="text-sm font-medium text-gray-500 mt-2">Manage your NFT collections</h1>

      {selectedCollection ? (
        <CollectionDetails collection={selectedCollection!} onBack={handleBackToCollections} />
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
