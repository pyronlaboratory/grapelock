import { z } from 'zod'

export const createCollectionFormSchema = z.object({
  collectionName: z.string().min(1, 'Collection name is required'),
  collectionSymbol: z.string().min(1, 'Collection symbol is required'),
  collectionDescription: z.string().optional(),
  collectionUri: z.string().optional(),
  creatorAddress: z.string(),
  creatorShare: z.coerce.number().min(0).max(100, 'Share must be between 0 and 100'),
  sellerFee: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
  maxSupply: z.coerce.number().min(0, 'Max supply must be 0 or greater'),
})
export type CreateCollectionFormType = z.infer<typeof createCollectionFormSchema>
