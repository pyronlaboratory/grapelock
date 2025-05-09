import { z } from 'zod'
import { Types } from 'mongoose'
export const objectIdSchema = z.custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, {
  message: '_id must be a MongoDB ObjectId',
})
export const collectionStatus = z.enum(['pending', 'processing', 'published', 'failed', 'archived'])
export const collectionSchema = z.object({
  _id: objectIdSchema, // from MongoDB
  collectionName: z.string(),
  collectionSymbol: z.string(),
  collectionDescription: z.string().nullable().optional(),
  collectionMedia: z.string().nullable().optional(),
  collectionMetadataUri: z.string().nullable().optional(),
  creatorAddress: z.string(),
  sellerFeeBasisPoints: z.number().min(0).max(10000),
  maxSupply: z.number().min(0),
  mintAddress: z.string().nullable().optional(),
  metadataAddress: z.string().nullable().optional(),
  masterEditionAddress: z.string().nullable().optional(),
  status: collectionStatus,
  txSignature: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export const createCollectionSchema = z.object({
  collectionName: z.string().min(1, 'Collection name is required'),
  collectionSymbol: z.string().min(1, 'Collection symbol is required'),
  collectionDescription: z.string().optional(),
  collectionMedia: z.string().optional(),
  creatorAddress: z.string(),
  sellerFeeBasisPoints: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
  maxSupply: z.coerce.number().min(0, 'Max supply must be 0 or greater'),
})
export type CollectionResource = z.infer<typeof collectionSchema>
export type CollectionStatus = z.infer<typeof collectionStatus>
export type CreateCollectionResource = z.infer<typeof createCollectionSchema>
