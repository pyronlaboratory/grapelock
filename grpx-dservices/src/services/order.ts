import { getApiContext } from '../lib/context.js'
import { Order } from '../models/order.js'
import { CreateOrderResource, OrderResource } from '../types/order.types.js'

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

export async function updateOrder(id: string, payload: Partial<OrderResource>): Promise<OrderResource> {
  try {
    const updatedOffer = await Order.findByIdAndUpdate(
      id,
      {
        status: payload.status,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedOffer) {
      context.log.error('Offer not found or update failed:', id)
      throw new Error('Offer not found or update failed')
    }

    return updatedOffer.toObject() as OrderResource
  } catch (error: any) {
    context.log.error('Error updating order:', error)
    throw new Error(`Failed to update order: ${error.message}`)
  }
}
