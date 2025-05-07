// app/marketplace/asset-manager/[id]/page.tsx

import Loading from '@/app/(dashboard)/loading'
import { useGetNFTDetails } from '@/components/nft/nft-data-access'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  CalendarIcon,
  Clock,
  Edit,
  Info,
  Radio,
  ShieldCheck,
  Smartphone,
  TableProperties,
  Tag,
  Wine,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

import { NFTTags } from '@/components/nft/nft-ui'

interface Props {
  params: Promise<{ id: string }>
}

type StatusType =
  | 'pending'
  | 'processing'
  | 'failed'
  | 'minted'
  | 'linked'
  | 'verified'
  | 'in_circulation'
  | 'delivered'
  | 'consumed'
  | 'cancelled'
  | 'burned'
  | 'unlinked'
  | 'degraded'
  | 'in_transit'
  | 'inactive'
  | 'active'
  | 'tampered'
  | 'deactivated'
  | 'decommissioned'
  | 'low_battery'
  | 'offline'
  | 'error'
  | 'maintenance'

interface StatusBadgeProps {
  status: StatusType
  withDot?: boolean
  withPulse?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  withDot = true,
  withPulse = true,
  size = 'md',
  className,
}) => {
  // Define status colors and animations
  const statusConfig: Record<StatusType, { bgColor: string; textColor: string; dotColor: string; animation?: string }> =
    {
      active: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        dotColor: 'bg-status-active',
        animation: 'animate-pulse',
      },
      inactive: { bgColor: 'bg-gray-100', textColor: 'text-gray-700', dotColor: 'bg-status-inactive' },
      pending: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        dotColor: 'bg-status-pending',
        animation: 'animate-pulse',
      },
      processing: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        dotColor: 'bg-status-processing',
        animation: 'animate-pulse',
      },
      failed: { bgColor: 'bg-red-100', textColor: 'text-red-800', dotColor: 'bg-status-failed' },
      minted: { bgColor: 'bg-purple-100', textColor: 'text-purple-800', dotColor: 'bg-purple-500' },
      linked: { bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', dotColor: 'bg-indigo-500' },
      verified: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        dotColor: 'bg-green-700',
        animation: 'animate-glow',
      },
      in_circulation: {
        bgColor: 'bg-cyan-100',
        textColor: 'text-cyan-800',
        dotColor: 'bg-cyan-500',
        animation: 'animate-pulse',
      },
      delivered: { bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', dotColor: 'bg-emerald-500' },
      consumed: { bgColor: 'bg-slate-100', textColor: 'text-slate-800', dotColor: 'bg-slate-500' },
      cancelled: { bgColor: 'bg-rose-100', textColor: 'text-rose-800', dotColor: 'bg-rose-500' },
      burned: { bgColor: 'bg-stone-100', textColor: 'text-stone-800', dotColor: 'bg-stone-500' },
      unlinked: { bgColor: 'bg-orange-100', textColor: 'text-orange-800', dotColor: 'bg-orange-500' },
      degraded: {
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        dotColor: 'bg-status-warning',
        animation: 'animate-pulse',
      },
      in_transit: {
        bgColor: 'bg-sky-100',
        textColor: 'text-sky-800',
        dotColor: 'bg-sky-500',
        animation: 'animate-pulse',
      },
      tampered: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        dotColor: 'bg-status-tampered',
        animation: 'animate-pulse',
      },
      deactivated: { bgColor: 'bg-neutral-100', textColor: 'text-neutral-800', dotColor: 'bg-neutral-500' },
      decommissioned: { bgColor: 'bg-zinc-100', textColor: 'text-zinc-800', dotColor: 'bg-zinc-500' },
      low_battery: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        dotColor: 'bg-status-warning',
        animation: 'animate-pulse',
      },
      offline: { bgColor: 'bg-slate-100', textColor: 'text-slate-800', dotColor: 'bg-slate-500' },
      error: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        dotColor: 'bg-status-failed',
        animation: 'animate-pulse',
      },
      maintenance: { bgColor: 'bg-blue-100', textColor: 'text-blue-800', dotColor: 'bg-blue-500' },
    }

  const config = statusConfig[status] || statusConfig.inactive

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.75',
    lg: 'text-base px-3 py-1',
  }

  // Dot size classes
  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        className,
      )}
    >
      {withDot && (
        <span
          className={cn('mr-1.5 rounded-full', config.dotColor, dotSizeClasses[size], withPulse && config.animation)}
        />
      )}
      <span className="capitalize">{status.replace(/_/g, ' ')}</span>
    </span>
  )
}

export function NFTMedia({ nftMedia, nftName }: any) {
  return (
    <div className="relative overflow-hidden rounded-lg aspect-square bg-muted/20 border">
      {nftMedia ? (
        <img src={nftMedia} alt={nftName} className="object-cover w-full h-full" />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No media available</p>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm hover:bg-background"
      >
        <Edit className="h-3.5 w-3.5 mr-1" /> Change
      </Button>
    </div>
  )
}
export function NFTBasicInformation({ nftSymbol, nftType, batchSize, maxSupply, sellerFeeBasisPoints }: any) {
  return (
    <div className="border rounded-md">
      <div className="blob-shape p-4 rounded-lg">
        <h3 className="font-medium mb-3 flex items-center text-sm">
          <Info className="h-4 w-4 mr-2 text-xs" /> Basic Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Symbol:</span>
            <span className="font-medium">{nftSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium capitalize">{nftType}</span>
          </div>
          {nftType === 'batch' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch Size:</span>
              <span className="font-medium">{batchSize || 'N/A'}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Supply:</span>
            <span className="font-medium">{maxSupply}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee Points:</span>
            <span className="font-medium">{sellerFeeBasisPoints}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export function NFTTimestamps({ createdAt, updatedAt }: any) {
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  return (
    <div className="border rounded-md ">
      <div className="blob-shape p-4 rounded-lg">
        <h3 className="font-medium mb-3 flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2" /> Timestamps
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{formatDate(createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated:</span>
            <span className="font-medium">{formatDate(updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export function NFTHeading({ nftName, nftDescription }: any) {
  return (
    <Card className="rounded-md bg-accent-background">
      <CardHeader className="flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          <h3>NFT Name</h3>
          <p className="text-xs text-muted-foreground">681a1d...q3340</p>
        </div>
        <div>
          <StatusBadge status="minted" withDot={true} withPulse={true} />
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground/80">
        A unique digital asset representing a physical product with verified authenticity and tracking.
      </CardContent>
    </Card>
  )
}
export function NFTPhysicalAsset({ nftDescription }: any) {
  return (
    <Card className="px-6 rounded-md bg-accent-background">
      <CardTitle>
        <div className="flex items-center gap-2">
          <Wine className="h-4 w-4" />
          Asset
        </div>
      </CardTitle>
    </Card>
  )
}

export function NFTAttributes({ nftDescription }: any) {
  return (
    <Card className="px-6 rounded-md bg-accent-background">
      <CardTitle>
        <div className="flex items-center gap-2">
          <TableProperties className="h-4 w-4" />
          Attributes
        </div>
      </CardTitle>
    </Card>
  )
}

export function NFTBeacons({ nftDescription }: any) {
  return (
    <Card className="px-6 rounded-md bg-accent-background">
      <CardTitle>
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4" />
          Beacons
        </div>
      </CardTitle>
    </Card>
  )
}

export default async function NFTDetailsPage({ params }: Props) {
  const { id } = await params
  // const { data: nft, isLoading } = useGetNFTDetails(id)
  // if (isLoading) return <Loading />
  const isVerified = false
  return (
    <>
      <div className="p-8 mx-auto block lg:flex gap-6">
        <div className="w-full lg:w-[350px] flex-none gap-6 flex flex-col">
          <NFTMedia />
          <NFTBasicInformation />
          <NFTTimestamps />
          {/* Button should be only visible when nft is verified */}
          {/* Show modal and ask to set a selling price */}
          <Button
            variant="outline"
            className={` font-semibold mb-6 text-primary/20 hover:!text-primary/40 ${isVerified ? '!cursor-pointer !bg-green-400 hover:!bg-green-300 !text-green-950' : '!cursor-not-allowed'}`}
          >
            Ready for Sale
          </Button>
        </div>
        <div className="w-full grow space-y-6">
          <NFTHeading />
          <NFTTags />
          <NFTBeacons />
          <NFTPhysicalAsset />
          <NFTAttributes />
          {/* <div>Verification Logs/Blockchain data</div> */}
        </div>
      </div>
    </>
  )
}
