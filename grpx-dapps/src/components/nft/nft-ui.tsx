import React, { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react'
import api, { ApiResponse } from '@/lib/api'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletUi } from '@wallet-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ChevronRight, ChevronLeft, Info, Flame, X, Eye, MoreHorizontal, ArrowLeft, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '../ui/separator'

import { FormUploadField } from '../ui/form-upload'
import { CollectionStatusEnumType, CollectionType, CreateCollectionFormType } from '@/schemas/collection'
import { createCollectionFormSchema } from '../../schemas/collection'
import { AppModal } from '../app-modal'
import { motion } from 'framer-motion'
import { DialogClose } from '../ui/dialog'
import { ellipsify, formatDate, getCollectionIdenticon, getRandomAvatar } from '@/lib/utils'
import { Badge, badgeVariants } from '../ui/badge'

import { CheckCircle, Clock, XCircle, FileArchive, Loader2 } from 'lucide-react'
import { VariantProps } from 'class-variance-authority'
import { toast } from 'sonner'
import { useJobMonitor } from '@/hooks/use-job-monitor'

interface CollectionStatusBadgeProps {
  status: CollectionStatusEnumType
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
  completed: {
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
  CollectionStatusEnumType,
  {
    label: string
    variant: VariantProps<typeof badgeVariants>['variant']
    icon?: React.ReactNode
  }
>
interface CollectionTableProps {
  collections: CollectionType[]
  onViewCollection: (collection: CollectionType) => void
}
interface CollectionDetailsProps {
  collection: CollectionType
  nfts: any // NFTType[];
  onBack: () => void
  onCreateNFT: () => void
}
interface EmptyCollectionProps {
  collection: CollectionType
  onCreateNFT: () => void
}
interface NFTGridProps {
  nfts: any //NFT[]
}
interface NFTCardProps {
  nft: any //NFT
}

type WineType = any
type SupplyChainStep = any

const mockSupplyChain: SupplyChainStep[] = [
  { stage: 'Harvest', date: '2019-09-15', location: 'Bordeaux, France', verifier: 'Chateau Margaux', complete: true },
  {
    stage: 'Production',
    date: '2019-10-05',
    location: 'Bordeaux, France',
    verifier: 'Chateau Margaux',
    complete: true,
  },
  { stage: 'Bottling', date: '2022-03-18', location: 'Bordeaux, France', verifier: 'Chateau Margaux', complete: true },
  { stage: 'Authentication', date: '2022-03-20', location: 'Bordeaux, France', verifier: 'VinTrust', complete: true },
  {
    stage: 'Export',
    date: '2022-04-10',
    location: 'Bordeaux, France',
    verifier: 'Wine Export Authority',
    complete: true,
  },
  { stage: 'Import', date: '2022-04-25', location: 'New York, USA', verifier: 'US Wine Imports', complete: true },
  {
    stage: 'Distribution',
    date: '2022-05-15',
    location: 'New York, USA',
    verifier: 'Premium Wine Distributors',
    complete: true,
  },
  {
    stage: 'Current Owner',
    date: '2022-06-01',
    location: 'New York, USA',
    verifier: 'Blockchain Verified',
    complete: true,
  },
]
const mockWine: WineType = {
  id: 'cm-2015-0042',
  name: 'Chateau Margaux Grand Vin',
  vintage: 2015,
  region: 'Bordeaux, France',
  vineyard: 'Chateau Margaux',
  varietal: 'Cabernet Sauvignon, Merlot Blend',
  authenticatedDate: '2022-03-20',
  bottleNumber: 42,
  totalBottles: 12000,
  price: 1250,
  imageUrl: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg',
  rarity: 'Rare',
  currentOwner: '8xft7UHPqPCwFm8NtjYxLF9RdmGDs8sUZqzspNQmZA2L',
  transactionCount: 3,
  verificationStatus: 'Verified',
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
export function CreateCollectionForm() {
  const wallet = useWallet()
  const [activeTab, setActiveTab] = useState('basic')
  const { enqueue } = useJobMonitor()

  const nextTab = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (activeTab === 'basic') setActiveTab('metadata')
    else if (activeTab === 'metadata') setActiveTab('creator')
    else if (activeTab === 'creator') setActiveTab('minting')
  }
  const prevTab = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (activeTab === 'minting') setActiveTab('creator')
    else if (activeTab === 'creator') setActiveTab('metadata')
    else if (activeTab === 'metadata') setActiveTab('basic')
  }
  const form = useForm<CreateCollectionFormType>({
    resolver: zodResolver(createCollectionFormSchema),
    defaultValues: {
      collectionName: '',
      collectionSymbol: '',
      collectionDescription: '',
      collectionMedia: '',
      creatorAddress: wallet.publicKey?.toBase58(),
      creatorShare: 100,
      sellerFee: 500,
      maxSupply: 0,
    },
  })
  async function onSubmit(payload: CreateCollectionFormType) {
    console.log('Form submitted:', JSON.stringify(payload))
    const response = await api<
      ApiResponse<{
        data: CollectionType
        jobId: string
        jobStatus: 'queued' | 'processing' | 'success' | 'failed'
      }>
    >('collections', {
      method: 'POST',
      body: payload,
    })
    console.log(response)
    const { success, data } = response
    if (success && data.jobStatus === 'queued') {
      enqueue({ jobId: data.jobId, status: 'queued' })
      toast(`Job ${data.jobId} queued`, { description: `Tracking job progress in background` })
    }
  }

  return (
    <Card className="w-full md:w-xl">
      <CardHeader>
        <CardTitle>Collection Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 w-auto ">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="creator">Creator</TabsTrigger>
            <TabsTrigger value="minting">Minting</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <TabsContent value="basic">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="collectionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Premium Wines 2023" {...field} />
                        </FormControl>
                        <FormDescription>The name of your NFT collection</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collectionSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="PW23" {...field} />
                        </FormControl>
                        <FormDescription>A short symbol for your collection (like a stock ticker)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collectionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Winter Collection—2025" {...field} />
                        </FormControl>
                        <FormDescription>A short description for your collection</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="metadata">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="collectionMedia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Media</FormLabel>
                        <FormUploadField
                          wallet={wallet}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={!!form.formState.errors.collectionMedia}
                          disabled={form.formState.isSubmitting}
                        />
                        <FormDescription>Link to your collection image or html (Arweave/IPFS)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="creator">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="creatorAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creator Address</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || wallet.publicKey?.toBase58()}
                            placeholder={wallet.publicKey?.toBase58()}
                            className="text-muted-foreground cursor-not-allowed opacity-40"
                            readOnly
                          />
                        </FormControl>
                        <FormDescription className="">
                          Defaults to your connected wallet; Support for adding collaborators will be available soon
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creatorShare"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creator Share (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormDescription>Percentage of earnings the creator will receive (0-100)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sellerFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seller Fee (basis points)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="10000" placeholder="500" {...field} />
                        </FormControl>
                        <FormDescription>Royalty fee for secondary sales (500 = 5%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="minting">
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground">
                    <strong className="flex gap-4 mb-2 tracking-normal">
                      <Info className="h-5 w-5" />
                      Minting Authority
                    </strong>

                    <p className="text-neutral-650">
                      The wallet used to create the collection controls the minting process and can mint new NFTs. Once
                      minted, NFTs can be transferred or sold, and the minting authority cannot manage them.
                    </p>
                  </div>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="maxSupply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Supply</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="1000" {...field} />
                        </FormControl>
                        <FormDescription>
                          Total number of NFTs allowed in this collection (0 for unlimited)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <div className="flex justify-between pt-4 z-10">
                {activeTab !== 'basic' && (
                  <Button type="button" variant="outline" onClick={prevTab}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                )}

                {activeTab !== 'minting' ? (
                  <Button type="button" className="ml-auto" onClick={nextTab}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit">Create Collection</Button>
                )}
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-6">
        <div className="w-full mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{
              width:
                activeTab === 'basic'
                  ? '25%'
                  : activeTab === 'metadata'
                    ? '50%'
                    : activeTab === 'creator'
                      ? '75%'
                      : '100%',
            }}
          />
        </div>
      </CardFooter>
    </Card>
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
  return (
    <AppModal title={label} size="sm" variant="default" shineEffect={shineEffect} classes={classes}>
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
          <CreateCollectionForm />
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

export function CollectionTable({ collections, onViewCollection }: CollectionTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-accent my-8">
      <table className="min-w-full divide-y divide-accent">
        <thead className="bg-primary-foreground">
          <tr>
            <th
              scope="col"
              className="min-w-lg px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Collection
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>

            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            ></th>
          </tr>
        </thead>
        <tbody className="bg-accent-background divide-y divide-accent">
          {collections.map((collection) => (
            <tr
              key={collection._id}
              className="hover:bg-primary-foreground transition duration-150 ease-in-out cursor-pointer"
              onClick={() => onViewCollection(collection)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={collection.collectionMedia || getCollectionIdenticon(collection._id)}
                      alt={collection.collectionName}
                    />
                  </div>
                  <div className="ml-4">
                    <div>
                      <div className="text-sm font-medium text-neutral-400 text-pretty">
                        {collection.collectionName}
                      </div>
                      <div className="text-sm text-neutral-600 font-semibold">{collection.collectionSymbol}</div>
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-neutral-400">
                <CollectionStatusBadge status={collection.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-neutral-400 text-sm text-pretty">
                {formatDate(collection.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 transition">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export function CollectionDetails({ collection, nfts, onBack, onCreateNFT }: CollectionDetailsProps) {
  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-gray-300 hover:text-gray-900 transition">
          <ArrowLeft size={18} className="mr-1" />
          <span>Back to Collections</span>
        </button>

        <Button onClick={onCreateNFT} size="sm" className="">
          <PlusCircle size={16} className="mr-1" />
          Create NFT
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="relative h-48 bg-gray-200">
          <img
            src={collection?.collectionMedia || getCollectionIdenticon(collection?._id)}
            alt={collection?.collectionName}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold">{collection?.collectionName}</h1>
              <span className="text-sm bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                {collection?.collectionSymbol}
              </span>
            </div>
            <CollectionStatusBadge status={collection?.status} />
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Creator</h3>
              <p className="mt-1">{ellipsify(collection?.creatorAddress)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Max Supply</h3>
              <p className="mt-1">{collection?.maxSupply}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1">{formatDate(collection?.createdAt)}</p>
            </div>
          </div>

          {collection?.collectionDescription && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-gray-900">{collection?.collectionDescription}</p>
            </div>
          )}

          {collection?.errorMessage && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800">Error Message</h3>
              <p className="mt-1 text-red-700">{collection?.errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">NFTs in this Collection</h2>
        <p className="text-gray-600">
          {nfts.length
            ? `Showing ${nfts.length} NFT${nfts.length !== 1 ? 's' : ''}`
            : 'No NFTs found in this collection'}
        </p>
      </div>

      {nfts.length > 0 ? (
        <NFTGrid nfts={nfts} />
      ) : (
        <EmptyCollection collection={collection} onCreateNFT={onCreateNFT} />
      )}
    </div>
  )
}

export function EmptyCollection({ collection, onCreateNFT }: EmptyCollectionProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
        <PlusCircle className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">No NFTs in this collection</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating your first NFT in the {collection?.collectionName} collection.
      </p>
      <div className="mt-6">
        <Button onClick={onCreateNFT} className="inline-flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New NFT
        </Button>
      </div>
    </div>
  )
}

export function NFTGrid({ nfts }: NFTGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {nfts.map((nft: any) => (
        <NFTCard key={nft._id} nft={nft} />
      ))}
    </div>
  )
}

export function NFTCard({ nft }: NFTCardProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'secondary'
      case 'MINTED':
        return 'primary'
      case 'MINTING':
        return 'outline'
      case 'FAILED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden transition duration-200 hover:shadow-md">
      <div className="h-40 overflow-hidden">
        <img
          src={nft.image || getRandomAvatar()}
          alt={nft.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 truncate">{nft.name}</h3>
          <Badge variant={getStatusBadgeVariant(nft.status)}>{nft.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{nft.description || 'No description available'}</p>

        {nft.attributes && nft.attributes.length > 0 && (
          <div className="mt-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase">Attributes</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {nft.attributes.slice(0, 3).map(
                (
                  attr: {
                    trait_type:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<unknown, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<unknown, string | JSXElementConstructor<any>>
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined
                    value: any
                  },
                  index: Key | null | undefined,
                ) => (
                  <div key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    <span className="font-medium">{attr.trait_type}:</span> {String(attr.value)}
                  </div>
                ),
              )}
              {nft.attributes.length > 3 && (
                <div className="px-2 py-1 bg-gray-100 rounded text-xs">+{nft.attributes.length - 3} more</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
