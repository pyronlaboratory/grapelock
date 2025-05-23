import { z } from 'zod'
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
  message: '_id must be a 24-char hex string',
})
export const collectionStatusEnum = z.enum(['pending', 'processing', 'published', 'failed', 'archived'])
export const collectionSchema = z.object({
  _id: objectIdSchema,
  collectionName: z.string(),
  collectionSymbol: z.string(),
  collectionDescription: z.string().nullable().optional(),
  collectionMedia: z.string().nullable().optional(),
  collectionMetadataUri: z.string().nullable().optional(),
  sellerFeeBasisPoints: z.number().min(0).max(10000),
  creatorAddress: z.string(),
  ownerAddress: z.string(),
  tokenMintAddress: z.string().nullable().optional(),
  tokenAccountAddress: z.string().nullable().optional(),
  metadataAccountAddress: z.string().nullable().optional(),
  masterEditionAccountAddress: z.string().nullable().optional(),
  status: collectionStatusEnum,
  signature: z.string().nullable().optional(),
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
    .max(5, 'Collection symbol must be 5 characters or less'),
  collectionDescription: z.string().optional(),
  collectionMedia: z.string().optional(),
  creatorAddress: z.string(),
  sellerFeeBasisPoints: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
})
export const collectionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(collectionSchema),
})
export const collectionDetailsResponseSchema = z.object({
  success: z.boolean(),
  data: collectionSchema,
})
export type CollectionResource = z.infer<typeof collectionSchema>
export type CollectionStatus = z.infer<typeof collectionStatusEnum>
export type CreateCollectionFormResource = z.infer<typeof createCollectionFormSchema>
