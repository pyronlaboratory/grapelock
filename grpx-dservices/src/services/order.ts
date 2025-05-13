import { getApiContext } from '../lib/context.js'
import { Order } from '../models/order.js'
import { CreateOrderResource, OrderResource } from '../types/order.types.js'
import { updateNFT } from './nft.js'
import { updateOffer } from './offer.js'

const context = await getApiContext()

export async function getOrders(publicKey: string): Promise<OrderResource[]> {
  console.log('Fetching orders for public key:', publicKey)
  try {
    // Fetch orders where the producer or consumer's public key matches the given public key
    const orders = await Order.find({
      $or: [{ producerPublicKey: publicKey }, { consumerPublicKey: publicKey }],
    })

    return orders.map((order) => order.toObject() as OrderResource)
  } catch (error: any) {
    context.log.error('Error fetching orders:', error)
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }
}

export async function createOrder(payload: CreateOrderResource): Promise<OrderResource> {
  try {
    const newOrder = await Order.create({
      offerId: payload.offerId,
      producerPublicKey: payload.producerPublicKey,
      consumerPublicKey: payload.consumerPublicKey,
    })

    return newOrder.toObject() as OrderResource
  } catch (error: any) {
    context.log.error('Error creating order:', error)
    throw new Error(`Failed to create order: ${error.message}`)
  }
}

export async function confirmOrder(id: string, payload: Partial<OrderResource>): Promise<OrderResource> {
  try {
    if (payload.status !== 'completed') throw new Error('Only orders with status "completed" can be confirmed.')
    const updatedOrder = await updateOrder(id, payload)
    const updatedOffer = await updateOffer(updatedOrder.offerId.toString(), { status: 'completed' })
    await updateNFT(updatedOffer.nftId.toString(), {
      status: 'primary_sale_happened',
    })

    return updatedOrder as OrderResource
  } catch (error: any) {
    context.log.error('Error confirming order:', error)
    throw new Error(`Failed to confirm order: ${error.message}`)
  }
}

export async function updateOrder(id: string, payload: Partial<OrderResource>): Promise<OrderResource> {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: payload.status,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedOrder) {
      context.log.error('Order not found or update failed:', id)
      throw new Error('Order not found or update failed')
    }

    return updatedOrder.toObject() as OrderResource
  } catch (error: any) {
    context.log.error('Error updating order:', error)
    throw new Error(`Failed to update order: ${error.message}`)
  }
}
