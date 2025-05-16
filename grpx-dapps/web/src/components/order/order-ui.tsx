import React, { useState } from 'react'
import { OrderResource } from '@/schemas/order'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
interface OrderItemProps {
  order: OrderResource
}

export const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isActionable = order.status === 'awaiting_confirmation' || order.status === 'awaiting_delivery'

  return (
    <Card className="mb-4 dark:border-none">
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              {/* Update this */}
              <Badge variant={'default'} className="mr-2" />
              <span className="text-sm text-gray-500">Order ID: {order._id.slice(0, 8)}...</span>
            </div>
            <div className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-4">
              <div>
                <span className="text-sm text-gray-500">Producer:</span>{' '}
                <span className="text-sm font-medium">{formatAddress(order.producerPublicKey)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Consumer:</span>{' '}
                <span className="text-sm font-medium">{formatAddress(order.consumerPublicKey)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Created:</span>{' '}
                <span className="text-sm">{formatDate(order.createdAt)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Updated:</span>{' '}
                <span className="text-sm">{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>

          {isActionable && (
            <div className="flex mt-4 md:mt-0 space-x-2">
              {order.status === 'awaiting_confirmation' && (
                <Button variant="default" size="sm">
                  Confirm Delivery
                </Button>
              )}
              {order.status === 'awaiting_delivery' && (
                <Button variant="outline" size="sm">
                  Track Shipment
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderItem

import {
  ArrowRight,
  ClockArrowUp,
  MoreVerticalIcon,
  PackageCheckIcon,
  ShoppingBagIcon,
  UserCheck2,
  UserCheckIcon,
} from 'lucide-react'

// import { OrderStatus } from './OrderStatus'
import { ellipsify } from '@wallet-ui/react'
import { formatDate } from 'date-fns'
import { Check, Clock, ChevronUp, ChevronDown, Coffee, PackageOpen, UserCheck } from 'lucide-react'

type OrderStatusProps = {
  status: string
}

const stages = [
  { name: 'Created', icon: ClockArrowUp },
  { name: 'Pending', icon: PackageCheckIcon },
  { name: 'Confirmed', icon: UserCheck2 },
  { name: 'Completed', icon: Check },
]

export function OrderStatus({ status }: OrderStatusProps) {
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
type OrderCardProps = {
  order: {
    _id: string
    offerId: string
    consumerPublicKey: string
    producerPublicKey: string
    status: string
    createdAt: string | Date
    updatedAt: string | Date
  }
  userRole?: 'consumer' | 'producer'
}
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ExplorerLink } from '../cluster/cluster-ui'
type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'awaiting_delivery':
        return 'bg-blue-50 dark:bg-blue-200 text-blue-600 border-blue-200'
      case 'awaiting_confirmation':
        return 'bg-yellow-50 dark:bg-yellow-300 text-yellow-600 border-yellow-200'
      case 'confirmed':
        return 'bg-amber-50 dark:bg-amber-200 text-amber-600 border-amber-200'
      case 'completed':
        return 'bg-green-50 dark:bg-green-200 text-green-600 border-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-4 py-1 rounded-full text-xs font-medium border my-2 ml-auto mr-2',
        getStatusStyles(),
      )}
    >
      {status}
    </span>
  )
}

export function OrderCard({ order, userRole = 'consumer' }: OrderCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border rounded-lg p-4 mb-4 hover:shadow-sm transition-shadow dark:shadow-none dark:border-none dark:bg-black">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {userRole === 'producer' ? (
                  <>
                    <DropdownMenuItem>Fulfill Order</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>Accept Order</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <div>
              <div className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Order ID</div>
              <h3 className="font-medium">{ellipsify(order._id, 6)}</h3>
            </div>
          </div>

          <StatusBadge status={order.status} />
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
            <OrderStatus status={order.status} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Sender</div>
              <div className="text-sm font-medium dark:border-b w-fit dark:border-b-white">
                <ExplorerLink
                  label={ellipsify(order.consumerPublicKey, 4)}
                  path={`account/${order.consumerPublicKey}`}
                />
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 animate-pulse" />

            <div className="text-right">
              <div className="text-xs text-muted-foreground">Recipient</div>
              <div className="text-sm font-medium dark:border-b w-fit dark:border-b-white">
                <ExplorerLink
                  label={ellipsify(order.producerPublicKey, 4)}
                  path={`account/${order.producerPublicKey}`}
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
