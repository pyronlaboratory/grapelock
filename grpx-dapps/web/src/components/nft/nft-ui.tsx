'use client'
import React, { ReactElement, useState } from 'react'
import { useWalletUi } from '@wallet-ui/react'

import {
  Info,
  Flame,
  X,
  Plus,
  FileQuestion,
  PackagePlus,
  Check,
  CheckCircle,
  Clock,
  XCircle,
  FileArchive,
  Loader2,
} from 'lucide-react'

import { Badge, badgeVariants } from '../ui/badge'
import { VariantProps } from 'class-variance-authority'
import { Card, CardContent } from '@/components/ui/card'
import { CollectionStatus, CollectionResource } from '@/schemas/collection'
import { DialogClose } from '../ui/dialog'

import { AppModal } from '../app-modal'
import { NFTCollectionForm } from './forms/nft-collection-form'
import { NFTMintingForm } from './forms/nft-minting-form'
import { getCollectionIdenticon } from '@/lib/utils'
import { motion } from 'framer-motion'
import { NFTResource } from '@/schemas/nft'
import Link from 'next/link'

interface EmptyGridProps {
  collection: CollectionResource
}

interface CollectionStatusBadgeProps {
  status: CollectionStatus
}
const statusConfigMap = {
  pending: {
    label: 'Pending',
    variant: 'default',
    icon: <Clock className="size-3.5 text-muted-foreground" />,
  },
  processing: {
    label: 'Processing',
    variant: 'processing',
    icon: <Loader2 className="size-3.5 animate-spin text-blue-800" />,
  },
  published: {
    label: 'Registered',
    variant: 'registered',
    icon: <CheckCircle className="size-3.5 text-yellow-800" />,
  },
  failed: {
    label: 'Failed',
    variant: 'destructive',
    icon: <XCircle className="size-3.5 text-red-800" />,
  },
  archived: {
    label: 'Archived',
    variant: 'secondary',
    icon: <FileArchive className="size-3.5 text-gray-400" />,
  },
} satisfies Record<
  CollectionStatus,
  {
    label: string
    variant: VariantProps<typeof badgeVariants>['variant']
    icon?: React.ReactNode
  }
>

export function GetStarted() {
  return (
    <div className="min-w-[350px] max-w-md md:max-w-lg w-auto mx-auto flex flex-col items-center justify-center px-8 py-8 relative md:absolute md:left-1/2 top-10 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-gradient-to-r from-background via-primary-foreground to-accent rounded-2xl h-[500px]">
      <div className="p-4 bg-background rounded-full mb-6">
        <Flame className="h-12 w-12 text-yellow-600" />
      </div>

      <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3">Register Mint</h2>

      <p className="text-sm text-center text-muted-foreground tracking-wide max-w-xs mb-16">
        Create a master edition to start publishing on the marketplace
      </p>

      <CreateCollectionModal
        label={'Start Creating'}
        classes={
          'w-full h-12 -bottom-15 relative overflow-hidden bg-background hover:bg-green-500 text-yellow-600 hover:text-black transition-colors cursor-pointer group'
        }
        shineEffect
      />
    </div>
  )
}
export function EmptyCollection({ collection }: EmptyGridProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 bg-accent rounded-full flex items-center justify-center">
        <FileQuestion className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-accent-background">No NFTs in this collection</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Get started by creating your first NFT in the {collection?.collectionName} collection.
      </p>
      <div className="mt-6">
        <NFTMintingModal
          label={
            <p className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create New NFT
            </p>
          }
          data={collection._id}
          classes="bg-accent-foreground dark:bg-accent text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary"
        />
      </div>
    </div>
  )
}
export function NFTMintingModal({
  label = '✨ Mint NFT',
  classes = '',
  shineEffect = false,
  data = null,
}: {
  label?: string | ReactElement
  classes?: string
  shineEffect?: boolean
  data?: Object | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <AppModal
      title={label}
      size="lg"
      variant="default"
      shineEffect={shineEffect}
      classes={classes}
      open={open}
      onOpenChange={setOpen}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 bg-background/80 z-100 "
      >
        <div className="mx-auto relative md:absolute md:left-1/2 top-10 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-background p-4 rounded-xl">
          <DialogClose asChild>
            <button
              className="cursor-pointer absolute top-6 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
          <NFTMintingForm onSuccess={() => setOpen(false)} data={data} />
        </div>
      </motion.div>
    </AppModal>
  )
}
export function CreateCollectionModal({
  label = '🌱 Create New',
  classes = '',
  shineEffect = false,
}: {
  label?: string
  classes?: string
  shineEffect?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title={label}
      size="sm"
      variant="default"
      shineEffect={shineEffect}
      classes={classes}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 bg-background/80 z-40"
      >
        <div className="max-w-sm md:max-w-2xl mx-auto relative md:absolute md:left-1/2 top-10 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
          <DialogClose asChild>
            <button
              className="cursor-pointer absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
          <NFTCollectionForm onSuccess={() => setOpen(false)} />
        </div>
      </motion.div>
    </AppModal>
  )
}
export function CollectionStatusBadge({ status }: CollectionStatusBadgeProps) {
  const config = statusConfigMap[status] ?? {
    label: status,
    variant: 'secondary',
  }
  return (
    <Badge variant={config.variant}>
      {config.icon && <span>{config.icon}</span>}
      {config.label}
    </Badge>
  )
}
// TODO: Refactor
export function CollectionHeader({ collection }: { collection: CollectionResource }) {
  return (
    <div className="bg-background/40 rounded-lg shadow overflow-hidden mb-8 border-accent border">
      <div className="relative h-64">
        <img
          src={collection?.collectionMedia || getCollectionIdenticon(collection?._id)}
          alt={collection?.collectionName}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <div className="absolute bottom-0 left-0 p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold">{collection?.collectionName}</h1>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
              {collection?.collectionSymbol}
            </span>
          </div>
          <p className="mt-1 text-accent-background">{collection?.collectionDescription}</p>
        </div>
      </div>
    </div>
  )
}
export function CollectionGallery({ nfts, collection }: any) {
  return (
    <div className="px-2 mt-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-secondary-background">Factory collection</h2>
        <p className="text-gray-600">
          {nfts.length
            ? `Showing ${nfts.length} NFT${nfts.length !== 1 ? 's' : ''}`
            : 'No NFTs found in this collection'}
        </p>
      </div>

      {nfts?.length ? <NFTGrid nfts={nfts} /> : <EmptyCollection collection={collection} />}
    </div>
  )
}
export function NFTGrid({ nfts }: { nfts: NFTResource[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {nfts.map((nft: any) => (
        <NFTCard key={nft._id} nft={nft} />
      ))}
    </div>
  )
}
export function NFTCard({ nft }: { nft: NFTResource }) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'minted':
        return 'secondary'
      case 'verified':
        return 'primary'
      case 'pending':
        return 'outline'
      case 'failed':
        return 'destructive'
      case 'processing':
        return 'processing'
      default:
        return 'default'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden transition duration-200 hover:shadow-md cursor-pointer">
      <Link href={`/asset-manager/${nft._id}`}>
        <div className="h-40 overflow-hidden">
          <img
            src={nft.nftMedia || getCollectionIdenticon(nft._id)}
            alt={nft.nftName}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900 truncate">{nft.nftName}</h3>
            <Badge variant={getStatusBadgeVariant(nft.status)}>{nft.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{nft.nftDescription || 'No description available'}</p>

          {nft.nftAttributes && nft.nftAttributes.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Attributes</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {nft.nftAttributes.slice(0, 3).map((attribute, index) => (
                  <div key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    <span className="font-medium">{attribute?.trait_type}:</span> {String(attribute?.value)}
                  </div>
                ))}
                {nft.nftAttributes.length > 3 && (
                  <div className="px-2 py-1 bg-gray-100 rounded text-xs">+{nft.nftAttributes.length - 3} more</div>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
export function NFTTypeSelection({ handleTypeSelection }: any) {
  return (
    <div className="min-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-accent dark:bg-purple-300 p-2 rounded-lg">
            <PackagePlus className="h-6 w-6 text-purple-800 dark:text-purple-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-yellow-600 text-pretty">Create a Digital Twin</h1>
            <p className="text-xs text-gray-500 tracking-wide font-medium ">Mint verifiable NFTs</p>
          </div>
        </div>
      </div>

      <Card className="mb-0 shadow-none !bg-transparent gap-2 border-none p-0">
        {/* <CardHeader className="mb-0 px-0">
          <CardTitle className="flex justify-between text-pretty w-full text-secondary-background">
            <CardDescription>Choose the type of wine product you want to register as an NFT</CardDescription>
            <Badge
              variant="outline"
              className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            >
              Preview Mode
            </Badge>
          </CardTitle>
        </CardHeader> */}
        <CardContent className="space-y-8 px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card
              className={`cursor-pointer border-2 shadow-none !bg-accent hover:border-purple-400 hover:shadow-md transition-all`}
              onClick={() => handleTypeSelection('single')}
            >
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-300 rounded-full flex items-center justify-center mb-4">
                  <span className="text-8xl">🍾</span>
                </div>
                <h3 className="text-xl font-bold my-2">Individual Bottle</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm max-w-[256px] text-pretty">
                  Register a single, unique wine bottle as an NFT
                </p>
                <ul className="text-sm text-left space-y-2 w-full p-7">
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-green-500">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Perfect for rare, collectible wines</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-green-500">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Detailed provenance tracking</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-green-500">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Individual environmental monitoring</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer border-2 shadow-none !bg-accent !hover:bg-primary-foreground hover:border-purple-400 hover:shadow-md transition-all px-0`}
              onClick={() => handleTypeSelection('batch')}
            >
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-300 rounded-full flex items-center justify-center mb-4">
                  <span className="text-8xl">📦</span>
                </div>
                <h3 className="text-xl font-bold my-2">Collection Bundle</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm max-w-[256px] text-pretty">
                  Register multiple bottles, cases, or barrels as a single NFT
                </p>
                <ul className="text-sm text-left space-y-2 w-full p-7">
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-green-500">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Ideal for cases, barrels, or collections</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-green-500">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Efficient for bulk shipments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-green-500">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Simplified logistics tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Not sure which to choose?</AlertTitle>
            <AlertDescription className="text-primary">
              Choose “Individual Bottle” for premium wines with unique features. Collection Bundles are ideal for
              multiple items that share the same properties or are shipped together.
            </AlertDescription>
          </Alert> */}
          <div className="border-1 text-sm text-white border-sidebar-primary-foreground dark:border-sidebar-primary bg-blue-400/80 p-4 rounded-md">
            <strong className="flex gap-4 mb-2 tracking-normal">
              <Info className="h-5 w-5" />
              Not sure which to choose?
            </strong>

            <p className="text-white">
              Choose “Individual Bottle” for premium wines with unique features. Collection Bundles are ideal for
              multiple items that share the same properties or are shipped together.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const DefaultContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'chain'>('details')
  const { connected } = useWalletUi()

  return (
    <div className="flex gap-8 flex-col">
      <div className="rounded-md border-1 border-accent p-32">Featured NFT card</div>
      <div className="rounded-md border-1 border-accent p-32">Filterable NFT Gallery with Pagination</div>
    </div>
  )
}
