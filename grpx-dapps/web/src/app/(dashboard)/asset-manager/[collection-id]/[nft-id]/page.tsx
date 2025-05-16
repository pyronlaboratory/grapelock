// app/marketplace/asset-manager/[collection-id][nft-id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useGetNFTDetails } from '@/components/nft/nft-data-access'
import ErrorScreen from '@/app/(dashboard)/error'
import NFTDetails from '@/components/nft/nft-details'

export default function NFTDetailsPage() {
  const params = useParams()
  const nftId = params['nft-id'] as string
  const query = useGetNFTDetails(nftId)

  return (
    <div className="p-8 max-w-6xl mx-auto  block lg:flex gap-6">
      {query.isError && <ErrorScreen />}
      {query.isSuccess && (
        <div className="">
          <NFTDetails nft={query.data} />
        </div>
      )}
    </div>
  )
}
