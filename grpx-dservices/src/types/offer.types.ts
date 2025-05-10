import { Types } from 'mongoose'
import { z } from 'zod'
export const objectIdSchema = z.custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, {
  message: '_id must be a MongoDB ObjectId',
})
export const offerStatus = z.enum(['open', 'closed', 'completed', 'failed'])
export const createOfferSchema = z.object({
  nftId: z.string(),
  nftMintAddress: z.string(),
  sellingPrice: z.number().positive(),
  producerAddress: z.string().nullable().optional(),
  offerAddress: z.string().nullable().optional(),
  vaultAddress: z.string().nullable().optional(),
  txSignature: z.string().nullable().optional(),
})
export const offerSchema = z.object({
  _id: objectIdSchema,
  nftId: z.string(),
  nftMintAddress: z.string(),
  sellingPrice: z.number().positive(),
  producerAddress: z.string().nullable().optional(),
  offerAddress: z.string().nullable().optional(),
  vaultAddress: z.string().nullable().optional(),
  status: offerStatus,
  txSignature: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  __v: z.number().optional(),
})
export type CreateOfferResource = z.infer<typeof createOfferSchema>
export type OfferStatus = z.infer<typeof offerStatus>
export type OfferResource = z.infer<typeof offerSchema>
