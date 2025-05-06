import React, { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react'
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

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge, badgeVariants } from '../ui/badge'
import { VariantProps } from 'class-variance-authority'
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CollectionStatusEnumType, CollectionType } from '@/schemas/collection'
import { DialogClose } from '../ui/dialog'

import { AppModal } from '../app-modal'
import { NFTCollectionForm } from './forms/nft-collection-form'
import { NFTMintingForm } from './forms/nft-minting-form'
import { getCollectionIdenticon, getRandomAvatar } from '@/lib/utils'
import { motion } from 'framer-motion'

interface EmptyGridProps {
  collection: CollectionType
}
interface NFTGridProps {
  nfts: any //NFT[]
}
interface NFTCardProps {
  nft: any //NFT
}
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
export function CollectionHeader({ collection }: { collection: CollectionType }) {
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
    <div className="p-6">
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

{
  /* <FormLabel htmlFor="imageUpload">Media</FormLabel>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Drag & drop an image or click to browse</p>
                    <p className="text-xs text-gray-400">Recommended: 1000×1000px, Max: 5MB</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Select File
                    </Button>
                  </div>
                </div> */
}
{
  /* <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-950 p-2 rounded-lg">
            <Wine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wine NFT Registration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {nftType === 'SINGLE' ? 'Individual Bottle Registration' : 'Collection Bundle Registration'}
            </p>
          </div>
        </div> */
}

// import { Switch } from '@/components/ui/switch'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { cn } from '@/lib/utils'
// import { format } from 'date-fns'
// import { Calendar } from '@/components/ui/calendar'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// creatorAddress: '',
// royaltyBasisPoints: 500, // 5%
// productType: 'Wine Bottle',
// serialNumber: '',
// manufacturer: '',
// manufactureDate: new Date(),
// longitude: null,
// latitude: null,
// address: '',
// length: null,
// width: null,
// height: null,
// dimensionUnit: 'CM',
// weight: null,
// weightUnit: 'KG',
// vintage: new Date().getFullYear() - 3,
// grapeVariety: '',
// region: '',
// alcoholContent: null,
// bottleSize: 'standard',
// harvestDate: null,
// bottlingDate: null,
// agingDetails: '',
// isOrganic: false,
// isBiodynamic: false,
// isSustainable: false,
// chips: [],
// sensors: [],

// creatorAddress: z.string().min(1, 'Creator address is required'),
// royaltyBasisPoints: z.number().min(0).max(10000),

// // Physical Product
// productType: z.string().min(1, 'Product type is required'),
// serialNumber: z.string().min(1, 'Serial number is required'),
// manufacturer: z.string().min(1, 'Manufacturer is required'),
// manufactureDate: z.date(),

// // Location
// longitude: z.number().optional().nullable(),
// latitude: z.number().optional().nullable(),
// address: z.string().optional(),

// // Dimensions
// length: z.number().optional().nullable(),
// width: z.number().optional().nullable(),
// height: z.number().optional().nullable(),
// dimensionUnit: z.string().optional(),

// // Weight
// weight: z.number().optional().nullable(),
// weightUnit: z.string().optional(),

// // Wine Specific
// vintage: z.number().optional().nullable(),
// grapeVariety: z.string().optional(),
// region: z.string().optional(),
// alcoholContent: z.number().optional().nullable(),
// bottleSize: z.string().optional(),
// harvestDate: z.date().optional().nullable(),
// bottlingDate: z.date().optional().nullable(),
// agingDetails: z.string().optional(),

// // Certifications
// isOrganic: z.boolean().optional().default(false),
// isBiodynamic: z.boolean().optional().default(false),
// isSustainable: z.boolean().optional().default(false),

// // Tamper-Proof Chips
// chips: z
//   .array(
//     z.object({
//       chipId: z.string().min(1, 'Chip ID is required'),
//       chipType: z.string().min(1, 'Chip type is required'),
//       manufacturer: z.string().min(1, 'Manufacturer is required'),
//       publicKey: z.string().optional(),
//     }),
//   )
//   .optional()
//   .default([]),

// // Sensors
// sensors: z
//   .array(
//     z.object({
//       sensorId: z.string().min(1, 'Sensor ID is required'),
//       sensorType: z.string().min(1, 'Sensor type is required'),
//       manufacturer: z.string().min(1, 'Manufacturer is required'),
//       model: z.string().optional(),
//       minThreshold: z.number().optional().nullable(),
//       maxThreshold: z.number().optional().nullable(),
//       unit: z.string().optional(),
//       reportingInterval: z.number().optional().nullable(),
//     }),
//   )
//   .optional()
//   .default([]),

// const [chipStatus, setChipStatus] = useState('NOT_PAIRED')
// const [sensorStatus, setSensorStatus] = useState('NOT_PAIRED')
{
  /* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wine Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Reserve Cabernet Sauvignon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vintage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vintage Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1900"
                          max="2099"
                          placeholder="YYYY"
                          //   {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Winery/Producer</FormLabel>
                      <FormControl>
                        <Input placeholder="Winery name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bottle Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Unique identifier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region/Appellation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Napa Valley, Bordeaux" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grapeVariety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Grape Variety</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || 'cab_sauv'}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select grape variety" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cab_sauv">Cabernet Sauvignon</SelectItem>
                          <SelectItem value="merlot">Merlot</SelectItem>
                          <SelectItem value="pinot_noir">Pinot Noir</SelectItem>
                          <SelectItem value="chard">Chardonnay</SelectItem>
                          <SelectItem value="sauv_blanc">Sauvignon Blanc</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="alcoholContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcohol Content (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="e.g. 13.5"
                          //   {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bottleSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bottle Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || 'standard'}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select bottle size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="half">Half Bottle (375ml)</SelectItem>
                          <SelectItem value="standard">Standard (750ml)</SelectItem>
                          <SelectItem value="magnum">Magnum (1.5L)</SelectItem>
                          <SelectItem value="double_magnum">Double Magnum (3L)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasting Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the wine's aroma, flavor profile, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Harvest Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value!} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bottlingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Bottling Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value!} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="agingDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aging Details</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 18 months in French oak barrels" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Vineyard GPS Location</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Latitude"
                            // {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Longitude"
                            // {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <FormLabel>Certifications</FormLabel>
                <div className="flex items-center space-x-4 mt-2">
                  <FormField
                    control={form.control}
                    name="isOrganic"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Organic</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isBiodynamic"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Biodynamic</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isSustainable"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Sustainable</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div> */
}
// // Add a new chip
// const addChip = () => {
//   const currentChips = form.getValues('chips') || []
//   form.setValue('chips', [...currentChips, { chipId: '', chipType: 'NFC', manufacturer: '', publicKey: '' }])
//   setChipStatus('PAIRED')
// }

// // Remove a chip
// const removeChip = (index: number) => {
//   const currentChips = form.getValues('chips') || []
//   form.setValue(
//     'chips',
//     currentChips.filter((_, i) => i !== index),
//   )
//   if (currentChips.length <= 1) {
//     setChipStatus('NOT_PAIRED')
//   }
// }

// // Add a new sensor
// const addSensor = () => {
//   const currentSensors = form.getValues('sensors') || []
//   form.setValue('sensors', [
//     ...currentSensors,
//     {
//       sensorId: '',
//       sensorType: 'TEMPERATURE',
//       manufacturer: '',
//       model: '',
//       minThreshold: null,
//       maxThreshold: null,
//       unit: 'CELSIUS',
//       reportingInterval: 60,
//     },
//   ])
//   setSensorStatus('PAIRED')
// }

// // Remove a sensor
// const removeSensor = (index: number) => {
//   const currentSensors = form.getValues('sensors') || []
//   form.setValue(
//     'sensors',
//     currentSensors.filter((_, i) => i !== index),
//   )
//   if (currentSensors.length <= 1) {
//     setSensorStatus('NOT_PAIRED')
//   }
// }

{
  /* <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          >
            Preview Mode
          </Badge> */
}
{
  /* Verification Tab */
}
{
  /* <TabsContent value="verification" className="space-y-6"> */
}
{
  /* <Card> */
}
{
  /* <CardHeader>
                  <CardTitle>Tamper-Proof Chip</CardTitle>
                  <CardDescription>Configure the NFC/RFID chip for product verification</CardDescription>
                </CardHeader> */
}
{
  /* <CardContent className="space-y-6">
                  
                </CardContent> */
}
{
  /* </Card> */
}
{
  /* <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full w-3 h-3 ${chipStatus === 'PAIRED' ? 'bg-green-500' : 'bg-amber-500'}`}
                  ></div>
                  <div>
                    <h3 className="font-medium">Chip Status: {chipStatus === 'PAIRED' ? 'Paired' : 'Not Paired'}</h3>
                    <p className="text-sm text-gray-500">
                      {chipStatus === 'PAIRED' ? 'Chip ID: TPC-2023-05040XR' : 'No chip paired with this product'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => (chipStatus === 'PAIRED' ? setChipStatus('NOT_PAIRED') : addChip())}
                >
                  {chipStatus === 'PAIRED' ? 'Unpair' : 'Pair New Chip'}
                </Button>
              </div>

              {chipStatus === 'PAIRED' ? (
                <div className="grid grid-cols-1 gap-4">
                  {form.watch('chips')?.map((_, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Tamper-Proof Chip #{index + 1}</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeChip(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`chips.${index}.chipType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chip Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select chip type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NFC">NFC</SelectItem>
                                <SelectItem value="RFID">RFID</SelectItem>
                                <SelectItem value="BLE">Bluetooth Low Energy</SelectItem>
                                <SelectItem value="QR">QR Code</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`chips.${index}.chipId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chip ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Unique chip identifier" {...field} defaultValue="TPC-2023-05040XR" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`chips.${index}.manufacturer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manufacturer</FormLabel>
                            <FormControl>
                              <Input placeholder="Chip manufacturer" {...field} defaultValue="SecureWine Tech" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`chips.${index}.publicKey`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Public Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Chip's public key" {...field} defaultValue="0x7f9d8e2b5a3c1d6..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Alert className="text-sm text-sidebar-accent border-sidebar-primary bg-blue-400/80 p-4 rounded-md">
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Pairing Required</AlertTitle>
                  <AlertDescription>
                    Pair a tamper-proof chip to enable physical verification of your wine product.
                  </AlertDescription>
                </Alert>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>IoT Sensors</CardTitle>
                  <CardDescription>Attach sensors to monitor environmental conditions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full w-3 h-3 ${sensorStatus === 'PAIRED' ? 'bg-green-500' : 'bg-amber-500'}`}
                      ></div>
                      <div>
                        <h3 className="font-medium">
                          Sensor Status: {sensorStatus === 'PAIRED' ? 'Paired' : 'Not Paired'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {sensorStatus === 'PAIRED'
                            ? 'Sensor ID: WS-TEMP-7845'
                            : 'No sensors paired with this product'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => (sensorStatus === 'PAIRED' ? setSensorStatus('NOT_PAIRED') : addSensor())}
                    >
                      {sensorStatus === 'PAIRED' ? 'Unpair' : 'Pair New Sensor'}
                    </Button>
                  </div>

                  {sensorStatus === 'PAIRED' && (
                    <div className="grid grid-cols-2 gap-4">
                      {form.watch('sensors')?.map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Sensor #{index + 1}</h4>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSensor(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`sensors.${index}.sensorType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sensor Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select sensor type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="TEMPERATURE">Temperature</SelectItem>
                                    <SelectItem value="HUMIDITY">Humidity</SelectItem>
                                    <SelectItem value="LIGHT">Light/UV</SelectItem>
                                    <SelectItem value="SHOCK">Shock/Vibration</SelectItem>
                                    <SelectItem value="MULTI">Multi-sensor</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`sensors.${index}.sensorId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sensor ID</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Unique sensor identifier"
                                    {...field}
                                    defaultValue="WS-TEMP-7845"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`sensors.${index}.reportingInterval`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reporting Interval (minutes)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="60"
                                    // {...field}
                                    onChange={(e) =>
                                      field.onChange(e.target.value ? Number.parseInt(e.target.value) : null)
                                    }
                                    defaultValue="60"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-2">
                            <FormLabel>Alert Thresholds</FormLabel>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`sensors.${index}.minThreshold`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Min Temp (°C)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="10"
                                        // {...field}
                                        onChange={(e) =>
                                          field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)
                                        }
                                        defaultValue="10"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`sensors.${index}.maxThreshold`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Max Temp (°C)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="18"
                                        // {...field}
                                        onChange={(e) =>
                                          field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)
                                        }
                                        defaultValue="18"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`sensors.${index}.unit`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Unit</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || 'CELSIUS'}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="CELSIUS">Celsius</SelectItem>
                                        <SelectItem value="FAHRENHEIT">Fahrenheit</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card> */
}
{
  /* </TabsContent> */
}

{
  /* NFT Metadata Tab */
}
