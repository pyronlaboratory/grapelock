'use client'
import { useGetOrders } from '@/components/orders/order-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'
import { Loader2, MoreHorizontal } from 'lucide-react'
import { ellipsify } from '@wallet-ui/react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

export default function OrdersPage() {
  const { publicKey } = useWallet()
  const publicKeyString = useMemo(() => publicKey?.toBase58(), [publicKey])
  function handleFulfill(order: any) {
    console.log('Fulfill order', order)
    // Add fulfill logic
  }

  function handleCancel(order: any) {
    console.log('Cancel order', order)
    // Add cancel logic
  }

  function handleConfirm(order: any) {
    console.log('Confirm order', order)
    // Add confirm logic
  }

  const { data: orders, isLoading, error } = useGetOrders(publicKeyString)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage orders</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading orders...</span>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-medium">Error loading orders</p>
          <p className="text-sm mt-1">Please try again later</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Offer</th>
                {/* <th className="px-4 py-3 text-left font-medium text-muted-foreground">Consumer</th> */}
                {/* <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producer</th> */}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                {/* <th className="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th> */}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders?.map((order: any, index: number) => (
                  <tr key={order._id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="px-4 py-3 tracking-wide">{ellipsify(order._id, 6)}</td>
                    <td className="px-4 py-3 tracking-wide">{ellipsify(order.offerId, 6)}</td>
                    {/* <td className="px-4 py-3 font-mono text-xs">{ellipsify(order.consumerPublicKey, 10)}</td> */}
                    {/* <td className="px-4 py-3 font-mono text-xs">{ellipsify(order.producerPublicKey, 10)}</td> */}
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                    {/* <td className="px-4 py-3 text-muted-foreground">{formatDate(order.updatedAt)}</td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-500 hover:text-gray-700 transition">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {publicKeyString === order.producerPublicKey ? (
                            <>
                              <DropdownMenuItem onClick={() => handleFulfill(order)}>Fulfill</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCancel(order)}>Cancel</DropdownMenuItem>
                            </>
                          ) : publicKeyString === order.consumerPublicKey ? (
                            <>
                              <DropdownMenuItem
                                disabled={order.status !== 'awaiting_confirmation'}
                                onClick={() => order.status === 'awaiting_confirmation' && handleConfirm(order)}
                              >
                                Confirm
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCancel(order)}>Cancel</DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Helper function to format dates
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let bgColor = 'bg-gray-100 text-gray-800'

  switch (status?.toLowerCase()) {
    case 'completed':
      bgColor = 'bg-green-100 text-green-800'
      break
    case 'pending':
      bgColor = 'bg-yellow-100 text-yellow-800'
      break
    case 'cancelled':
      bgColor = 'bg-red-100 text-red-800'
      break
    case 'processing':
      bgColor = 'bg-blue-100 text-blue-800'
      break
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  )
}
