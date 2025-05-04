import { z } from 'zod'
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
  message: '_id must be a 24-char hex string',
})
export const collectionStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed', 'archived'])
export const collectionSchema = z.object({
  _id: objectIdSchema, // from MongoDB
  collectionName: z.string(),
  collectionSymbol: z.string(),
  collectionDescription: z.string().nullable().optional(),
  collectionMedia: z.string().nullable().optional(),
  collectionMetadataUri: z.string().nullable().optional(),
  creatorAddress: z.string(),
  creatorShare: z.number().min(0).max(100),
  sellerFee: z.number().min(0).max(10000),
  maxSupply: z.number().min(0),
  mintAddress: z.string().nullable().optional(),
  metadataAddress: z.string().nullable().optional(),
  masterEditionAddress: z.string().nullable().optional(),
  status: collectionStatusEnum,
  txSignature: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  __v: z.number().optional(),
})
export const createCollectionFormSchema = z.object({
  collectionName: z.string().min(1, 'Collection name is required'),
  collectionSymbol: z
    .string()
    .min(1, 'Collection symbol is required')
    .max(3, 'Collection symbol must be 3 characters or less'),
  collectionDescription: z.string().optional(),
  collectionMedia: z.string().optional(),
  creatorAddress: z.string(),
  creatorShare: z.coerce.number().min(0).max(100, 'Share must be between 0 and 100'),
  sellerFee: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
  maxSupply: z.coerce.number().min(0, 'Max supply must be 0 or greater'),
})
export const collectionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(collectionSchema),
})
export type CollectionType = z.infer<typeof collectionSchema>
export type CollectionStatusEnumType = z.infer<typeof collectionStatusEnum>
export type CreateCollectionFormType = z.infer<typeof createCollectionFormSchema>
