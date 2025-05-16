import React, { useState } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useConfirmOffer } from '@/hooks/use-confirm-offer'
import { useRefundOffer } from '@/hooks/use-refund-offer'
import { PublicKey } from '@solana/web3.js'
import { ellipsify } from '@wallet-ui/react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { OrderStatusBadge } from './order-status-badge'
import { OrderResource } from '@/schemas/order'
import { formatDate } from 'date-fns'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import {
  ArrowRight,
  Check,
  ChevronUp,
  ChevronDown,
  ClockArrowUp,
  MoreVerticalIcon,
  PackageCheckIcon,
  UserCheck2,
} from 'lucide-react'

const stages = [
  { name: 'Created', icon: ClockArrowUp },
  { name: 'Pending', icon: PackageCheckIcon },
  { name: 'Confirmed', icon: UserCheck2 },
  { name: 'Completed', icon: Check },
]

export function OrderProgress({ status }: { status: string }) {
  // Determine the current stage index based on status
  const getCurrentStageIndex = () => {
    switch (status.toLowerCase()) {
      case 'awaiting_delivery':
        return 0
      case 'awaiting_confirmation':
        return 1
      case 'confirmed':
        return 2
      default:
        return 3
    }
  }

  const currentStageIndex = getCurrentStageIndex()

  return (
    <div className="flex items-center w-full space-x-1">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.name}>
          {/* Stage icon */}
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border transition-all',
              index <= currentStageIndex
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-muted',
            )}
          >
            <stage.icon className="h-4 w-4" />
          </div>

          {/* Connection line */}
          {index < stages.length - 1 && (
            <div className={cn('h-1 flex-1 transition-all', index < currentStageIndex ? 'bg-primary' : 'bg-muted')} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export function OrderCard({ order, address }: { order: OrderResource; address: PublicKey }) {
  const [isOpen, setIsOpen] = useState(false)
  const confirmMutation = useConfirmOffer()
  const refundMutation = useRefundOffer()

  async function handleFulfill(order: OrderResource) {
    try {
      const response = await api(`orders/${order._id.toString()}`, {
        method: 'PATCH',
        body: {
          status: 'awaiting_confirmation',
        },
      })

      if (!response) throw new Error('Failed to fulfill order')

      toast.success('Order marked as awaiting confirmation')
    } catch (error: any) {
      console.error(error)
      toast.error('Failed to fulfill order')
    }
  }
  async function handleConfirm(order: OrderResource) {
    try {
      const response = await confirmMutation.mutateAsync({ orderObj: order })
      if (!response || response.status !== 'completed')
        return toast.error('Failed to confirm order delivery. Please try again.')

      const confirmation = await api(`orders/confirm/${order._id.toString()}`, {
        method: 'PUT',
        body: {
          status: 'completed',
        },
      })

      if (!confirmation) throw new Error('Failed to confirm order delivery status.')
      toast.success(`Purchase confirmed. NFT successfully transferred!`)
    } catch (error) {
      console.error('Error confirming order:', error)
      toast.error('Failed to confirm order. Please try again.')
    }
  }
  async function handleCancel(order: OrderResource) {
    try {
      const response = await refundMutation.mutateAsync({ orderObj: order })
      if (!response) return toast.error('Failed to refund order. Please try again.')

      // if response status is refunded i.e. program returned success.. then update order, offer, nft off-chain data.
      toast.success(`Refund confirmed.`)
    } catch (error) {
      console.error('Error refunding order:', error)
      toast.error('Failed to refund order. Please try again.')
    }
  }

  return (
    <div className="border rounded-lg p-4 mb-4 hover:shadow-sm transition-shadow dark:shadow-none dark:border-none dark:bg-black">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1.5">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {address.toBase58() === order.producerPublicKey ? (
                  <>
                    <DropdownMenuItem
                      disabled={order.status !== 'awaiting_delivery'}
                      onClick={() => order.status === 'awaiting_delivery' && handleFulfill(order)}
                    >
                      Fulfill
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCancel(order)}>Cancel</DropdownMenuItem>
                  </>
                ) : address.toBase58() === order.consumerPublicKey ? (
                  <>
                    <DropdownMenuItem
                      disabled={order.status !== 'awaiting_confirmation'}
                      onClick={() => order.status === 'awaiting_confirmation' && handleConfirm(order)}
                    >
                      Confirm
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={['completed', 'cancelled_by_producer', 'cancelled_by_consumer'].includes(order.status)}
                      onClick={() =>
                        !['completed', 'cancelled_by_producer', 'cancelled_by_consumer'].includes(order.status) &&
                        handleCancel(order)
                      }
                    >
                      Cancel
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div>
              <div className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Order ID</div>
              <h3 className="font-medium">{ellipsify(order._id, 6)}</h3>
            </div>
          </div>

          <OrderStatusBadge status={order.status} />
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-xs rounded-full px-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="my-6">
            <OrderProgress status={order.status} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Sender</div>
              <div className="text-sm font-medium dark:border-b w-fit dark:border-b-white">
                <ExplorerLink
                  label={ellipsify(order.producerPublicKey, 4)}
                  path={`account/${order.producerPublicKey}`}
                />
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 animate-pulse" />

            <div className="text-right">
              <div className="text-xs text-muted-foreground">Recipient</div>
              <div className="text-sm font-medium dark:border-b w-fit dark:border-b-white">
                <ExplorerLink
                  label={ellipsify(order.consumerPublicKey, 4)}
                  path={`account/${order.consumerPublicKey}`}
                />
              </div>
            </div>
          </div>
          <div className="my-4 pt-3 border-t">
            <div className="text-xs text-primary/60 mb-4 uppercase font-semibold">Details</div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-6 lg:gap-y-2 md:mb-4">
              {[
                ['Offer', order.offerId],
                ['NFT Token Account', order.offerId],
                ['Escrow (Sender)', order.offerId],
                ['Escrow (Receiver)', order.offerId],
              ].map(([label, id]) => (
                <div key={label} className="col-span-1">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-sm font-medium text-blue-400 border-b w-fit border-blue-400">
                    <ExplorerLink label={ellipsify(id, 4)} path={`account/${id}`} />
                  </div>
                </div>
              ))}

              <div className="col-span-1">
                <div className="text-xs text-muted-foreground lg:text-right">Price</div>
                <div className="text-sm lg:text-right text-green-400 font-medium">{0.001} SOL</div>
              </div>
            </div>
          </div>
          <div className="mt-0 grid grid-cols-1 gap-6 md:gap-0 sm:grid-cols-2 border-t pt-3 md:border-t-none">
            <div className="hidden sm:block mb-0 col-span-1">
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-xs text-muted-foreground/80 mt-1">
                {formatDate(order.createdAt, 'dd MMM yy')} · {formatDate(order.createdAt, '24:00')}
              </div>
            </div>
            <div className="mb-0 md:col-span-1 lg:text-right">
              <div className="text-xs text-muted-foreground lg:text-right">Last Updated</div>
              <div className="text-xs text-muted-foreground/80 mt-1">
                {formatDate(order.createdAt, 'dd MMM yy')} · {formatDate(order.createdAt, '24:00')}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
