'use client'
import { CreateCollectionModal, GetStarted } from './nft-ui'
import { CollectionTable } from './data-tables/nft-collection-table'
import { useGetCollections } from './nft-data-access'
import { PublicKey } from '@solana/web3.js'
import ErrorScreen from '@/app/(dashboard)/error'

export function NFTCollectionManager({ address }: { address: PublicKey }) {
  const query = useGetCollections(address.toBase58())
  return (
    <div className="p-8 max-w-6xl mx-auto ">
      <h1 className="text-2xl font-bold text-primary">All Collections 📦</h1>
      <h1 className="text-sm font-medium text-gray-500 mt-2">Manage your NFT collections</h1>

      {query.isError && <ErrorScreen />}
      {query.isSuccess && (
        <div className="">
          {query.data.length === 0 ? (
            <div className="flex justify-center items-center h-100">
              <GetStarted />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -top-18 -right-0 rounded-xl">
                <CreateCollectionModal classes="bg-accent text-neutral-400 hover:bg-primary-foreground hover:text-primary px-6 h-[36px] rounded-lg  bg-blue-600 dark:bg-sidebar-primary text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary" />
              </div>
              <CollectionTable collections={query.data} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
