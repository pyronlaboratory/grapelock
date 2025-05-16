'use client'
import React, { ReactElement, useState } from 'react'
import Link from 'next/link'
import { useGetNFTs } from './nft-data-access'
import {
  Flame,
  Plus,
  FileQuestion,
  PackagePlus,
  CheckCircle,
  Clock,
  XCircle,
  FileArchive,
  Loader2,
  CalendarCheck2,
  Copy,
  ArrowRight,
} from 'lucide-react'

import { ellipsify } from '@wallet-ui/react'
import { getIdenticon } from '@/lib/utils'
import { CollectionStatus, CollectionResource } from '@/schemas/collection'
import { NFTResource, NFTStatus } from '@/schemas/nft'
import { NFTCollectionForm } from './forms/nft-collection-form'
import { NFTMintingForm } from './forms/nft-minting-form'

import { AppModal } from '../app-modal'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { VariantProps } from 'class-variance-authority'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from 'date-fns/format'

interface StatusBadgeProps {
  status: CollectionStatus
  classes?: string
}
// TODO: Extend for NFTStatus
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
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
export function AddressBox({ title, address }: { title: string; address: string }) {
  return (
    <div className="bg-gray-100 dark:bg-background/20 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <CopyButton text={address} />
      </div>
      <code className="text-sm w-full py-2 rounded-md block truncate">{ellipsify(address)}</code>
    </div>
  )
}
export function GetStarted() {
  return (
    <div className="border dark:border-none min-w-[350px] max-w-md md:max-w-lg w-auto mx-auto flex flex-col items-center justify-center px-8 py-8 relative md:absolute md:left-1/2 top-10 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-gradient-to-r from-background via-primary-foreground to-accent rounded-2xl h-[450px]">
      <div className="p-4 bg-background rounded-full mb-6">
        <Flame className="h-12 w-12 text-amber-400 dark:text-yellow-600" />
      </div>

      <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3">Register Mint</h2>

      <p className="text-sm text-center text-muted-foreground tracking-wide max-w-xs mb-2">
        Create a master edition to start publishing on the marketplace
      </p>

      <CreateCollectionModal
        label={'Start Creating'}
        classes={
          'w-full h-12 -bottom-15 relative overflow-hidden bg-gray-900 dark:bg-background hover:bg-green-500 text-amber-500 dark:text-yellow-600 hover:text-black transition-colors cursor-pointer group font-semibold'
        }
        shineEffect
      />
    </div>
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
      override={true}
      innerTitle={<span>🌱 Create New Collection</span>}
    >
      <NFTCollectionForm onSuccess={() => setOpen(false)} />
    </AppModal>
  )
}
export function CollectionStatusBadge({ status, classes = '' }: StatusBadgeProps) {
  const config = statusConfigMap[status] ?? {
    label: status,
    variant: 'secondary',
  }
  return (
    <Badge variant={config.variant} className={classes}>
      {config.icon && <span>{config.icon}</span>}
      {config.label}
    </Badge>
  )
}
export function CollectionHero({ collection }: { collection: CollectionResource }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-3 mb-2">
        <h1 className="text-2xl font-bold">{collection.collectionName}</h1>
        <span className="hidden sm:block text-xs bg-gray-200 dark:bg-muted/80 px-2 py-1 rounded-md backdrop-blur-sm">
          {collection.collectionSymbol}
        </span>
        <CollectionStatusBadge status={collection.status} classes="my-4 sm:ml-auto" />
      </div>

      <p className="hidden sm:block text-sm font-medium text-gray-500 mt-2 max-w-lg text-pretty">
        {collection.collectionDescription}
      </p>

      <div className="mt-16">
        <h3 className="text-sm font-medium text-gray-600">
          <span>Last updated</span>
        </h3>
        <div className="text-sm flex flex-row items-center gap-2 text-gray-400">
          <CalendarCheck2 className="h-4 w-4" />
          <p className="mt-1">{formatDate(collection.createdAt, 'dd MMM yy')}</p>
        </div>
      </div>

      <div className="mt-4 bg-background/40 rounded-b-lg shadow overflow-hidden mb-6 border-accent">
        <div className="relative h-64">
          <img
            src={collection?.collectionMedia || getIdenticon(collection?._id)}
            alt={collection?.collectionName}
            className={`w-full h-full object-${collection.collectionMedia ? 'cover' : 'contain'}`}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-white/60 dark:from-black/90 to-transparent"></div>
        </div>
      </div>
    </div>
  )
}
export function CollectionDetails({ collection }: { collection: CollectionResource }) {
  const { data: nfts = [], isLoading, error: nftsError } = useGetNFTs(collection._id)
  return (
    <Tabs defaultValue="nfts" className="space-y-4">
      <div className="flex flex-col-reverse gap-6 sm:flex-row justify-between">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>
        <NFTMintingModal
          data={collection._id}
          classes="bg-accent text-neutral-400 hover:bg-primary-foreground hover:text-primary px-4 h-[34px] rounded-lg bg-blue-600 dark:bg-sidebar-primary text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary"
        />
      </div>
      <TabsContent value="accounts">
        <Card>
          <CardHeader>
            <CardDescription>
              Essential addresses related to the token, metadata, and edition management.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { title: 'Token Mint', address: collection.tokenMintAddress },
              { title: 'Token Account', address: collection.tokenAccountAddress },
              { title: 'Metadata Account', address: collection.metadataAccountAddress },
              { title: 'Master Edition Account', address: collection.masterEditionAccountAddress },
            ].map((item, index) => (
              <AddressBox title={item.title} address={item.address || ''} />
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="nfts">
        <Card className="bg-transparent border-none shadow-none pt-0 gap-2">
          <CardHeader className="px-0">
            <CardDescription>Total assets: {nfts.length}</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-1">
            <CollectionGallery collection={collection} nfts={nfts} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
export function CollectionEmpty({ collection }: { collection: CollectionResource }) {
  return (
    <div className="text-center my-8">
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
            <p className="inline-flex gap-2 items-center">
              Start Creating NFTs
              <ArrowRight className=" h-4 w-4" />
            </p>
          }
          data={collection._id}
          classes="bg-accent-foreground dark:bg-accent text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary"
        />
      </div>
    </div>
  )
}
export function CollectionGallery({ nfts, collection }: any) {
  return (
    <div className="max-w-6xl mx-auto">
      {nfts?.length ? <NFTGrid nfts={nfts} /> : <CollectionEmpty collection={collection} />}
    </div>
  )
}
export function NFTGrid({ nfts }: { nfts: NFTResource[] }) {
  return (
    <div className="flex flex-row flex-wrap gap-8 items-start">
      {nfts.map((nft: any) => (
        <NFTCard key={nft._id} nft={nft} />
      ))}
    </div>
  )
}
export function NFTStatusBadge({ status }: { status: string }) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'minted':
        return 'registered'
      case 'verified':
        return 'primary'
      case 'pending':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'processing':
        return 'processing'
      default:
        return 'default'
    }
  }
  return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
}
export function NFTCard({ nft }: { nft: NFTResource }) {
  return (
    <div className="bg-gray-100/80 dark:bg-black rounded-lg shadow overflow-hidden transition duration-200 hover:shadow-md cursor-pointer w-xs border">
      <Link href={`/asset-manager/${nft.collectionId}/${nft._id}`}>
        <div className="h-60 overflow-hidden">
          <img
            src={nft.nftMedia || getIdenticon(nft._id)}
            alt={nft.nftName}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="text-md font-medium text-primary line-clamp-1">{nft.nftName}</h3>
              <p className="tracking-wide text-pretty text-xs font-semibold uppercase text-primary/60">
                {nft.nftSymbol || 'GRPX'} • {nft.nftType}
              </p>
            </div>
            <NFTStatusBadge status={nft.status} />
          </div>

          {nft.nftAttributes && nft.nftAttributes.length > 0 && (
            <div className="mt-8">
              <div className="mt-2 flex flex-wrap gap-2">
                {nft.nftAttributes.slice(0, 2).map((attribute, index) => (
                  <div key={index} className="px-2 py-1 bg-gray-200 dark:bg-muted/80 rounded text-xs">
                    <span className="font-medium">{attribute?.trait_type}:</span> {String(attribute?.value)}
                  </div>
                ))}
                {nft.nftAttributes.length > 2 && (
                  <div className="px-2 py-1 bg-gray-100 dark:bg-muted/80 rounded text-xs">
                    +{nft.nftAttributes.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
export function NFTMintingModalHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-accent dark:bg-transparent dark:border p-2 rounded-lg border">
          <PackagePlus className="h-6 w-6 text-yellow-600 dark:text-yellow-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-yellow-600 text-pretty">Create a Digital Twin</h1>
          <p className="text-xs text-gray-500 tracking-normal font-medium text-left">Mint verifiable NFTs</p>
        </div>
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
      override={true}
      innerTitle={<NFTMintingModalHeader />}
    >
      <NFTMintingForm onSuccess={() => setOpen(false)} data={data} />
    </AppModal>
  )
}
