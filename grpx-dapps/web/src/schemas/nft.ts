import { z } from 'zod'
export const nftTypeEnum = z.enum(['single', 'batch'])
export const mintNFTFormSchema = z.object({
  nftType: nftTypeEnum,
  nftName: z.string(),
  nftSymbol: z.string(),
  nftDescription: z.string().optional(),
  nftMedia: z.string().nullable().optional(),
  nftExternalUrl: z.string().optional(),
  nftAttributes: z
    .array(
      z.object({
        trait_type: z.string().min(1, 'Trait type is required'),
        value: z.string().min(1, 'Value is required'),
      }),
    )
    .optional(),
  batchSize: z.number().optional().nullable(),
  batchType: z.string().optional().nullable(),
  collectionId: z.string(),
  creatorAddress: z.string(),
  sellerFeeBasisPoints: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
  maxSupply: z.coerce.number().min(0, 'Max supply must be 0 or greater'),
})

export type NFTType = z.infer<typeof nftTypeEnum>
export type MintNFTFormResource = z.infer<typeof mintNFTFormSchema>
export type NFTResource = any
