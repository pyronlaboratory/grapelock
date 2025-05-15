// app/marketplace/asset-manager/[collection-id][nft-id]/page.tsx
'use client'
import { NFTSaleModal } from '@/components/nft/forms/nft-sale-form'
import { NFTMedia } from '@/components/nft/widgets/nft-media'
import { NFTBasicInformation } from '@/components/nft/widgets/nft-basic'
import { NFTTimestamps } from '@/components/nft/widgets/nft-timestamps'
import { NFTBanner } from '@/components/nft/widgets/nft-banner'
import { NFTTags } from '@/components/nft/widgets/nft-tags'
import { NFTBeacons } from '@/components/nft/widgets/nft-beacons'
import { NFTPhysicalAsset } from '@/components/nft/widgets/nft-physical-asset'
import { NFTAttributes } from '@/components/nft/widgets/nft-attributes'
import { nftDetailsResponseSchema } from '@/schemas/nft'
import api from '@/lib/api'
import { useParams } from 'next/navigation'
import { useGetNFTDetails, useGetNFTs } from '@/components/nft/nft-data-access'

export default async function NFTDetailsPage() {
  const params = useParams()
  const nftId = params['nft-id'] as string
  const parsed = useGetNFTDetails(nftId)

  return (
    <div className="p-8 max-w-6xl mx-auto  block lg:flex gap-6">
      {parsed.data && (
        <>
          <div className="w-full lg:w-[350px] flex-none gap-6 flex flex-col">
            <NFTMedia nftMedia={parsed.data.nftMedia} nftName={parsed.data.nftName} nftId={parsed.data._id} />
            <NFTBasicInformation
              nftSymbol={parsed.data.nftSymbol}
              nftType={parsed.data.nftType}
              batchSize={parsed.data.batchSize || 0}
              batchType={parsed.data.batchType || ''}
              maxSupply={parsed.data.maxSupply}
              sellerFeeBasisPoints={parsed.data.sellerFeeBasisPoints}
            />
            <NFTTimestamps createdAt={parsed.data.createdAt} updatedAt={parsed.data.createdAt} />
            {/* Button should be only visible when nft is verified */}

            <NFTSaleModal
              nftId={parsed.data._id}
              nftCreatorAddress={parsed.data.creatorAddress!}
              nftMintAddress={parsed.data.mintAddress!}
              isVerified={parsed.data.status === 'minted'}
            />
          </div>

          <div className="w-full grow space-y-6">
            <NFTBanner
              nftName={parsed.data.nftName}
              nftMintAddress={parsed.data.mintAddress}
              nftDescription={parsed.data.nftDescription || ''}
            />
            <NFTTags />
            <NFTBeacons />
            <NFTPhysicalAsset />
            <NFTAttributes />
            {/* Add verification logs and timeline */}
          </div>
        </>
      )}
    </div>
  )
}
