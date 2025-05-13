import { Types } from 'mongoose'
import { z } from 'zod'
export const objectIdSchema = z.custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, {
  message: '_id must be a MongoDB ObjectId',
})
export const orderStatus = z.enum([
  'pending',
  'cancelled_by_producer',
  'cancelled_by_consumer',
  'awaiting_delivery',
  'awaiting_confirmation',
  'completed',
  'failed',
])
export const createOrderSchema = z.object({
  offerId: z.string(),
  producerPublicKey: z.string(),
  consumerPublicKey: z.string(),
})
export const orderSchema = z.object({
  _id: objectIdSchema,
  offerId: z.string(),
  producerPublicKey: z.string(),
  consumerPublicKey: z.string(),
  status: orderStatus,
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  __v: z.number().optional(),
})
export type CreateOrderResource = z.infer<typeof createOrderSchema>
export type OrderResource = z.infer<typeof orderSchema>
export type OrderStatus = z.infer<typeof orderStatus>
