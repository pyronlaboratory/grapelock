import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ellipsify } from '@wallet-ui/react'

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

export function NFTBanner({
  nftName,
  nftDescription,
  nftMintAddress,
}: {
  nftName: string
  nftDescription: string
  nftMintAddress?: string | null
}) {
  return (
    <Card className="rounded-md bg-accent-background">
      <CardHeader className="flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          <h3>{nftName}</h3>
          <p className="text-xs text-muted-foreground">{ellipsify(nftMintAddress || '...')}</p>
        </div>
        <div>
          <StatusBadge status="minted" withDot={true} withPulse={true} />
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground/80">{nftDescription}</CardContent>
    </Card>
  )
}
