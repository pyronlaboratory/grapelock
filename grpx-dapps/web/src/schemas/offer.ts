import { z } from 'zod'
import { nftSchema } from '../schemas/nft'
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
  message: '_id must be a 24-char hex string',
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
export const offerSchema = z
  .object({
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
  .passthrough()
export const extendedOfferSchema = offerSchema.extend({
  nft: nftSchema.optional(),
})
export const allOpenVerifiedOffersResponseSchema = z.object({
  data: z.array(extendedOfferSchema),
  success: z.boolean(),
})
export type CreateOfferResource = z.infer<typeof createOfferSchema>
export type OfferStatus = z.infer<typeof offerStatus>
export type OfferResource = z.infer<typeof offerSchema>
export type AllOpenVerifiedOffersResponse = z.infer<typeof allOpenVerifiedOffersResponseSchema>
export type ExtendedOfferResource = z.infer<typeof extendedOfferSchema>
