'use client'
import { GetStarted } from './nft-ui'
import { NFTCollectionsDataTable } from './data-tables/nft-collection-table'
import { useGetCollections } from './nft-data-access'
import { PublicKey } from '@solana/web3.js'
import { columns } from './data-tables/columns'
import ErrorScreen from '@/app/(dashboard)/error'

export function NFTCollectionManager({ address }: { address: PublicKey }) {
  const query = useGetCollections(address.toBase58())
  return (
    <div className="p-8 max-w-6xl mx-auto ">
      {query.isError && <ErrorScreen />}
      {query.isSuccess && (
        <div className="">
          {query.data.length === 0 ? (
            <div className="flex justify-center items-center h-100">
              <GetStarted />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-primary">All Collections 📦</h1>
              <h1 className="text-sm font-medium text-gray-500 mt-2">Manage your NFT collections</h1>
              <div className="relative">
                <NFTCollectionsDataTable columns={columns} data={query.data} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
