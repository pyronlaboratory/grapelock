import { NFTSaleModal } from '@/components/nft/forms/nft-sale-form'
import { NFTMedia } from '@/components/nft/widgets/nft-media'
import { NFTBasicInformation } from '@/components/nft/widgets/nft-basic'
import { NFTSolanaInformation } from '@/components/nft/widgets/nft-solana'
import { NFTTimestamps } from '@/components/nft/widgets/nft-timestamps'
import { NFTBanner } from '@/components/nft/widgets/nft-banner'
import { NFTTags } from '@/components/nft/widgets/nft-tags'
import { NFTBeacons } from '@/components/nft/widgets/nft-beacons'
import { NFTPhysicalAsset } from '@/components/nft/widgets/nft-physical-asset'
import { NFTFullResource } from '@/schemas/nft'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon } from 'lucide-react'

export default function NFTDetails({ nft }: { nft: NFTFullResource }) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-[350px] flex-none gap-6 flex flex-col">
        <NFTMedia nftMedia={nft.nftMedia} nftName={nft.nftName} nftId={nft._id.toString()} />
        <NFTBasicInformation
          nftName={nft.nftName}
          nftSymbol={nft.nftSymbol || 'GRPX'}
          nftType={nft.nftType}
          batchSize={nft.batchSize || 0}
          batchType={nft.batchType || ''}
        />
        <NFTSolanaInformation
          nftTokenMintAddress={nft.tokenMintAddress}
          nftTokenAccountAddress={nft.tokenAccountAddress}
          nftMetadataAccountAddress={nft.metadataAccountAddress}
          nftMasterEditionAccountAddress={nft.masterEditionAccountAddress}
          sellerFeeBasisPoints={nft.sellerFeeBasisPoints}
        />
        <NFTTimestamps createdAt={nft.createdAt} updatedAt={nft.createdAt} />

        {nft.tokenMintAddress && nft.tokenAccountAddress && (
          <>
            {nft.status !== 'verified' && (
              <span className="-mb-4 text-sm font-semibold text-amber-500 flex items-center gap-2">
                <InfoIcon className="h-4 w-4" />
                This option is only available for verified NFTs
              </span>
            )}
            <NFTSaleModal
              nftId={nft._id.toString()}
              nftCreatorAddress={nft.creatorAddress || 'unknown'}
              nftTokenMintAddress={nft.tokenMintAddress}
              nftTokenAccountAddress={nft.tokenAccountAddress}
              isVerified={nft.status === 'verified'}
              isDisabled={nft.status !== 'verified'}
            />
          </>
        )}
      </div>

      <div className="grow space-y-6 w-auto md:min-w-[650px]">
        <NFTBanner
          nftName={nft.nftName}
          nftType={nft.nftType}
          nftSymbol={nft.nftSymbol || 'GRPX'}
          nftDescription={nft.nftDescription}
          nftAttributes={nft.nftAttributes}
          nftStatus={nft.status}
        />

        {nft.tokenMintAddress ? (
          <>
            <NFTTags nftId={nft._id.toString()} tags={nft.tags ?? []} />
            <NFTBeacons />
          </>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative cursor-no-drop">
                  <div className="opacity-50 pointer-events-none space-y-6">
                    <NFTTags nftId={nft._id.toString()} tags={nft.tags ?? []} />
                    <NFTBeacons />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tags and Beacons are available only for NFTs with a resolvable token mint address</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* <NFTPhysicalAsset /> */}
        {/* Add verification logs and timeline */}
      </div>
    </div>
  )
}
