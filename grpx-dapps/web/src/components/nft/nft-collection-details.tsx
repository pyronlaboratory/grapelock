import { ellipsify, formatDate } from '@/lib/utils'
import { AlertCircle, CalendarCheck2, Copy, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { QRCodeSVG } from 'qrcode.react'
import { CollectionType } from '@/schemas/collection'
import { CollectionGallery, CollectionHeader, CollectionStatusBadge, NFTMintingModal } from './nft-ui'

interface CollectionDetailsProps {
  collection: CollectionType
  nfts: any // NFTType[];
  onBack: () => void
}

export function CollectionDetails({ collection, nfts, onBack }: CollectionDetailsProps) {
  return (
    <div className="animate-fadeIn relative">
      <div className="mb-8 flex items-center justify-between">
        {/* <button
            onClick={onBack}
            className="cursor-pointer flex items-center text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Main Gallery</span>
          </button> */}

        <div className="absolute -top-8 right-0 rounded-xl">
          <NFTMintingModal classes="bg-accent text-neutral-400 hover:bg-primary-foreground hover:text-primary px-6 h-[36px] rounded-lg  bg-blue-600 dark:bg-sidebar-primary text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary" />
        </div>
      </div>

      <CollectionHeader collection={collection} />

      <div className="flex items-center justify-between mb-6 px-1">
        <CollectionStatusBadge status={collection?.status} />
        <div className="text-right">
          <h3 className="text-sm font-medium text-gray-400">
            <span>Last updated</span>
          </h3>
          <div className="text-sm flex flex-row items-center gap-2">
            <CalendarCheck2 className="h-4 w-4" />
            <p className="mt-1">{formatDate(collection?.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 grid-flow-row auto-rows-max">
        <div className="flex flex-col sm:flex-row gap-8 bg-sidebar border rounded-xl px-8 py-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Creator</h3>
            <p className="mt-1 flex gap-4 items-center">
              {ellipsify(collection?.creatorAddress)} <Copy className="h-4 w-4" />
            </p>

            {collection?.creatorAddress && (
              <div className="flex flex-col items-center">
                <QRCodeSVG
                  value={`https://explorer.solana.com/address/${collection?.creatorAddress}?cluster=devnet`}
                  size={300}
                  level="Q"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  marginSize={4}
                  title="View creator on Solana Explorer"
                  className="rounded-xl mt-8"
                />
                <p className="mt-4 text-xs text-center text-gray-500">
                  Scan to view this creator address on&nbsp;
                  <a
                    href={`https://explorer.solana.com/address/${collection?.creatorAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    Solana Explorer
                  </a>
                </p>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="hidden sm:block" />

          <div className="gap-2 flex flex-col w-full">
            <div className="border-b w-full px-2 py-4">
              <h3 className="text-sm font-medium text-gray-500">Seller Fee Basis Points</h3>
              <p className="mt-1">{collection?.sellerFeeBasisPoints}</p>
            </div>
            <div className="w-full px-2 py-4">
              <h3 className="text-sm font-medium text-gray-500">Max Supply</h3>
              <p className="mt-1">{collection?.maxSupply}</p>
            </div>
            <div className="sticky top-full">
              <Button size={'lg'} className="w-full hover:bg-green-400 hover:text-green-900">
                <ShieldCheck />
                Transfer
              </Button>
            </div>
          </div>
        </div>

        <div className="gap-8 grid grid-cols-1 md:grid-cols-2">
          <div className="gap-8 flex flex-col">
            <div className="bg-sidebar border w-full rounded-xl px-8 py-4">
              <h3 className="text-sm font-medium text-gray-500">Transaction Signature</h3>
              <p className="mt-1 flex gap-4 items-center">
                {ellipsify(collection?.txSignature!)}
                <Copy className="h-4 w-4" />
              </p>
            </div>
            <div className="bg-sidebar border w-full rounded-xl px-8 py-4">
              <h3 className="text-sm font-medium text-gray-500">Mint Account</h3>
              <p className="mt-1 flex gap-4 items-center">
                {ellipsify(collection?.mintAddress!)}
                <Copy className="h-4 w-4" />
              </p>
            </div>
          </div>
          <div className="gap-8 flex flex-col">
            <div className="bg-sidebar border w-full rounded-xl px-8 py-4">
              <h3 className="text-sm font-medium text-gray-500">Metadata Account</h3>
              <p className="mt-1 flex gap-4 items-center">
                {ellipsify(collection?.metadataAddress!)}
                <Copy className="h-4 w-4" />
              </p>
            </div>
            <div className="bg-sidebar border w-full rounded-xl px-8 py-4">
              <h3 className="text-sm font-medium text-gray-500">Master Edition Account</h3>
              <p className="mt-1 flex gap-4 items-center">
                {ellipsify(collection?.masterEditionAddress!)}
                <Copy className="h-4 w-4" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {collection?.errorMessage && (
        <div className="flex  items-center justify-center relative border-red-800">
          <div className="w-full mt-6 px-4 py-3 bg-red-300 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800">Error Message</h3>
            <p className="mt-1 text-red-800">{collection?.errorMessage}</p>
            <AlertCircle className="absolute top-10 right-4 text-red-800" />
          </div>
        </div>
      )}

      <CollectionGallery collection={collection} nfts={nfts} />
    </div>
  )
}
