'use client'
import { CollectionType } from '@/schemas/collection'
import { useState } from 'react'
import { CollectionDetails, CollectionTable, CreateCollectionModal } from './nft-ui'
import { mockNFTs } from './nft-data-access'

interface NFTCollectionManagerProps {
  collections: CollectionType[]
}

export function NFTCollectionManager({ collections }: NFTCollectionManagerProps) {
  const [selectedCollection, setSelectedCollection] = useState<CollectionType | null>(null)
  const [isCreatingNFT, setIsCreatingNFT] = useState(false)

  const handleViewCollection = (collection: CollectionType) => {
    setSelectedCollection(collection)
    window.scrollTo(0, 0)
  }

  const handleBackToCollections = () => {
    setSelectedCollection(null)
    setIsCreatingNFT(false)
  }

  const handleCreateNFT = () => {
    setIsCreatingNFT(true)
    alert('NFT creation functionality would be implemented here')
    setIsCreatingNFT(false)
  }

  const getNFTsForCollection = (collectionId: string) => {
    return mockNFTs[collectionId] || []
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-neutral-400">NFT Collections Manager</h1>
      {selectedCollection ? (
        <CollectionDetails
          collection={selectedCollection!}
          nfts={getNFTsForCollection(selectedCollection!?._id)}
          onBack={handleBackToCollections}
          onCreateNFT={handleCreateNFT}
        />
      ) : (
        <div className="relative">
          <div className="absolute -top-14 right-0 rounded-xl">
            <CreateCollectionModal classes="bg-accent text-neutral-400 hover:bg-primary-foreground hover:text-primary px-6 h-[36px] rounded-lg" />
          </div>
          <CollectionTable collections={collections} onViewCollection={handleViewCollection} />
        </div>
      )}
    </div>
  )
}
