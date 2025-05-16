import React, { useState } from 'react'
import { OrderResource } from '@/schemas/order'
import { useGetOrders } from '@/components/order/order-data-access'
import { OrderCard } from './order-card'
import { PublicKey } from '@solana/web3.js'
import Loading from '@/app/(dashboard)/loading'
import ErrorScreen from '@/app/(dashboard)/error'

export default function OrderManager({ address }: { address: PublicKey }) {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')
  const { data: orders, isLoading, error } = useGetOrders(address.toBase58())

  const filteredOrders = orders?.filter((order: OrderResource) => {
    if (activeTab === 'incoming' && order.consumerPublicKey !== address.toBase58()) {
      return false
    }

    if (activeTab === 'outgoing' && order.producerPublicKey !== address.toBase58()) {
      return false
    }

    if (
      statusFilter === 'active' &&
      (order.status === 'completed' ||
        order.status === 'cancelled_by_producer' ||
        order.status === 'cancelled_by_consumer' ||
        order.status === 'failed')
    ) {
      return false
    }

    if (
      statusFilter === 'completed' &&
      (order.status === 'awaiting_delivery' || order.status === 'awaiting_confirmation')
    ) {
      return false
    }

    return true
  })

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {isLoading && <Loading />}
      {error && <ErrorScreen />}
      {orders?.length !== 0 && !isLoading ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary dark:text-white"> Orders and Shipments ˚ ༘⋆🛍️｡˚ </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Manage your incoming and outgoing orders</p>
            </div>
          </div>

          <div className="mb-6 border-b border-gray-200 dark:border-muted">
            <div className="flex flex-wrap gap-1">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
                  activeTab === 'incoming'
                    ? 'bg-primary-foreground text-blue-600 dark:text-green-300 '
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-muted dark:hover:text-primary/80'
                }`}
                onClick={() => setActiveTab('incoming')}
              >
                Incoming
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
                  activeTab === 'outgoing'
                    ? 'bg-primary-foreground text-blue-600 dark:text-blue-300 '
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-muted dark:hover:text-primary/80'
                }`}
                onClick={() => setActiveTab('outgoing')}
              >
                Outgoing
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                className={`cursor-pointer px-3 py-1 text-xs font-medium rounded-full ${
                  statusFilter === 'all'
                    ? 'bg-green-100 dark:bg-green-300 text-blue-800'
                    : 'bg-gray-100 dark:bg-muted/60  text-gray-800 dark:text-primary/60 hover:bg-gray-200 dark:hover:bg-muted'
                }`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`cursor-pointer px-3 py-1 text-xs font-medium rounded-full ${
                  statusFilter === 'active'
                    ? 'bg-green-100 dark:bg-green-300 text-blue-800'
                    : 'bg-gray-100 dark:bg-muted/60  text-gray-800 dark:text-primary/60 hover:bg-gray-200 dark:hover:bg-muted'
                }`}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </button>
              <button
                className={`cursor-pointer px-3 py-1 text-xs font-medium rounded-full ${
                  statusFilter === 'completed'
                    ? 'bg-green-100 dark:bg-green-300 text-blue-800'
                    : 'bg-gray-100 dark:bg-muted/60  text-gray-800 dark:text-primary/60 hover:bg-gray-200 dark:hover:bg-muted'
                }`}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          {filteredOrders?.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-muted/80 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 dark:text-primary">No orders found</p>
            </div>
          ) : (
            <div>
              {filteredOrders?.map((order: OrderResource) => (
                <OrderCard key={order._id} order={order} address={address} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
