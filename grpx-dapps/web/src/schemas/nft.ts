import { z } from 'zod'
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
  message: '_id must be a 24-char hex string',
})
export const nftTypeEnum = z.enum(['single', 'batch'])
export const nftStatusEnum = z.enum([
  'pending',
  'processing',
  'failed',
  'minted',
  'linked',
  'verified',
  'in_circulation',
  'primary_sale_happened',
  'consumed',
  'cancelled',
  'burned',
])
export const nftPhysicalAssetStatusEnum = z.enum([
  'unlinked',
  'linked',
  'verified',
  'degraded',
  'in_transit',
  'delivered',
  'consumed',
  'cancelled',
])
export const nftTagStatusEnum = z.enum(['inactive', 'active', 'tampered', 'deactivated', 'decommissioned'])
export const nftBeaconStatusEnum = z.enum([
  'inactive',
  'active',
  'low_battery',
  'offline',
  'error',
  'maintenance',
  'decommissioned',
])
export const nftSchema = z.object({
  _id: objectIdSchema,
  nftType: nftTypeEnum,
  nftName: z.string(),
  nftSymbol: z.string(),
  nftDescription: z.string().nullable().optional(),
  nftMedia: z.string().nullable().optional(),
  nftExternalUrl: z.string().nullable().optional(),
  nftMetadataUri: z.string().nullable().optional(),
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
  collectionId: objectIdSchema,
  creatorAddress: z.string(),
  ownerAddress: z.string(),
  status: nftStatusEnum,
  sellerFeeBasisPoints: z.number().min(0).max(10000),
  tokenAccountAddress: z.string().nullable().optional(),
  tokenMintAddress: z.string().nullable().optional(),
  metadataAccountAddress: z.string().nullable().optional(),
  masterEditionAccountAddress: z.string().nullable().optional(),
  signature: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  __v: z.number().optional(),
})
export const nftPhysicalAssetSchema = z.object({
  _id: objectIdSchema,
  nftId: objectIdSchema,
  productType: z.string(),
  serialNumber: z.string(),
  manufacturer: z.string(),
  manufactureDate: z.date(),
  location: z.object({
    current: z.object({
      longitude: z.number(),
      latitude: z.number(),
      address: z.string(),
      updatedAt: z.date(),
    }),
    history: z
      .array(
        z.object({
          longitude: z.number(),
          latitude: z.number(),
          address: z.string(),
          timestamp: z.date(),
        }),
      )
      .optional(),
  }),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    unit: z.string(),
  }),
  weight: z.object({
    value: z.number(),
    unit: z.string(),
  }),
  status: nftPhysicalAssetStatusEnum,
  containedItems: z.array(objectIdSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export const nftTagSchema = z.object({
  _id: objectIdSchema,
  chipId: z.string(),
  chipType: z.string(),
  manufacturer: z.string(),
  productId: objectIdSchema,
  activationDate: z.date(),
  publicKey: z.string(),
  lastVerifiedAt: z.date().optional(),
  verificationCount: z.number().optional(),
  status: nftTagStatusEnum,
  tamperHistory: z
    .array(
      z.object({
        timestamp: z.date(),
        detectionMethod: z.string(),
        details: z.string(),
      }),
    )
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export const nftBeaconSchema = z.object({
  _id: objectIdSchema,
  sensorId: z.string(),
  productId: objectIdSchema,
  sensorType: z.string(),
  manufacturer: z.string(),
  model: z.string(),
  firmwareVersion: z.string(),
  calibrationDate: z.date(),
  nextCalibrationDate: z.date(),
  batteryLevel: z.number(),
  connectionType: z.string(),
  reportingInterval: z.number(),
  alertThresholds: z.object({
    min: z.number(),
    max: z.number(),
    unit: z.string(),
  }),
  status: nftBeaconStatusEnum,
  location: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export const nftBeaconReadingSchema = z.object({
  _id: objectIdSchema,
  sensorId: objectIdSchema,
  timestamp: z.date(),
  readingType: z.string(),
  value: z.number(),
  unit: z.string(),
  isAbnormal: z.boolean(),
  batteryLevel: z.number(),
  signalStrength: z.number(),
  location: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
})
export const extendedNftSchema = nftSchema.extend({
  physicalAsset: nftPhysicalAssetSchema.nullish(),
  tags: z.array(nftTagSchema).optional(),
  beacons: z
    .array(
      nftBeaconSchema.extend({
        readings: z.array(nftBeaconReadingSchema).optional(),
      }),
    )
    .optional(),
})
export const nftsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(nftSchema),
})
export const nftDetailsResponseSchema = z.object({
  success: z.boolean(),
  data: extendedNftSchema,
})
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
})
export type NFTType = z.infer<typeof nftTypeEnum>
export type NFTResource = z.infer<typeof nftSchema>
export type MintNFTFormResource = z.infer<typeof mintNFTFormSchema>
