import { z } from 'zod'

export const collectionStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed', 'archived'])
export const collectionSchema = z.object({
  _id: z.string(), // from MongoDB
  collectionName: z.string(),
  collectionSymbol: z.string(),
  collectionDescription: z.string().optional(),
  collectionUri: z.string().optional(),
  collectionMetadataUri: z.string().optional(),
  creatorAddress: z.string(),
  creatorShare: z.number().min(0).max(100),
  sellerFee: z.number().min(0).max(10000),
  maxSupply: z.number().min(0),
  mintAddress: z.string().optional(),
  metadataAddress: z.string().optional(),
  masterEditionAddress: z.string().optional(),
  status: collectionStatusEnum,
  txSignature: z.string().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type CollectionType = z.infer<typeof collectionSchema>
export type CollectionStatusEnumType = z.infer<typeof collectionStatusEnum>

// Create
export const createCollectionSchema = z.object({
  collectionName: z.string().min(1, 'Collection name is required'),
  collectionSymbol: z.string().min(1, 'Collection symbol is required'),
  collectionDescription: z.string().optional(),
  collectionUri: z.string().optional(),
  creatorAddress: z.string(),
  creatorShare: z.coerce.number().min(0).max(100, 'Share must be between 0 and 100'),
  sellerFee: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
  maxSupply: z.coerce.number().min(0, 'Max supply must be 0 or greater'),
})
export type CreateCollectionType = z.infer<typeof createCollectionSchema>
