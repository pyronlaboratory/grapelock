import { Types } from 'mongoose'
import { z } from 'zod'
export const objectIdSchema = z.custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, {
  message: '_id must be a MongoDB ObjectId',
})
export const offerStatus = z.enum(['open', 'in_progress', 'closed', 'completed', 'failed'])
export const createOfferSchema = z.object({
  offer: z.string(),
  nftId: z.string(),
  sellingPrice: z.number().positive(),
  producer: z.string(),
  tokenMintA: z.string(),
  tokenMintB: z.string(),
  vaultTokenAccountA: z.string(),
  vaultTokenAccountB: z.string(),
  txSignature: z.string().nullable().optional(),
})
export const updateOfferSchema = z.object({
  offer: z.string().optional(),
  nftId: z.string().optional(),
  sellingPrice: z.number().positive().optional(),
  producer: z.string().optional(),
  consumer: z.string().nullable().optional(),
  tokenMintA: z.string().optional(),
  tokenMintB: z.string().optional(),
  vaultTokenAccountA: z.string().optional(),
  vaultTokenAccountB: z.string().optional(),
  status: offerStatus.optional(),
  txSignature: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  updatedAt: z.string().or(z.date()).optional(),
})
export const offerSchema = z.object({
  _id: objectIdSchema,
  offer: z.string(),
  nftId: z.string(),
  sellingPrice: z.number().positive(),
  producer: z.string(),
  consumer: z.string().nullable().optional(),
  tokenMintA: z.string(),
  tokenMintB: z.string(),
  vaultTokenAccountA: z.string(),
  vaultTokenAccountB: z.string(),
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
