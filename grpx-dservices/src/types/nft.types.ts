import { z } from 'zod'
import { Types } from 'mongoose'

export const objectIdSchema = z.custom<Types.ObjectId>((val) => val instanceof Types.ObjectId, {
  message: '_id must be a MongoDB ObjectId',
})
export const nftTypeEnum = z.enum(['single', 'batch'])

export const nftStatusEnum = z.enum([
  'pending',
  'processing',
  'failed',
  'minted',
  'verified',
  'in_circulation',
  'primary_sale_happened',
  'consumed',
  'cancelled',
  'burned',
])
export const nftPhysicalAssetStatusEnum = z.enum([
  'pending',
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
  nftSymbol: z.string().nullable().optional(),
  nftDescription: z.string().nullable().optional(),
  nftMedia: z.string().nullable().optional(),
  nftExternalUrl: z.string().nullable().optional(),
  nftMetadataUri: z.string().nullable().optional(),
  nftAttributes: z
    .array(
      z.object({
        trait_type: z.string().min(1, 'Trait type is required').nullable().optional(),
        value: z.string().min(1, 'Value is required').nullable().optional(),
      }),
    )
    .nullable()
    .optional(),
  batchSize: z.number().optional().nullable(),
  batchType: z.string().optional().nullable(),
  collectionId: objectIdSchema,
  creatorAddress: z.string().nullable().optional(),
  ownerAddress: z.string().nullable().optional(),
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
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  __v: z.number().optional(),
})
export const nftTagSchema = z.object({
  _id: objectIdSchema,
  nftId: objectIdSchema,
  assetId: objectIdSchema.optional(),
  chipId: z.string(),
  chipType: z.string().optional(),
  chipManufacturer: z.string().optional(),
  activationDate: z.string().or(z.date()),
  lastVerifiedAt: z.string().or(z.date()),
  verificationCount: z.number().optional(),
  status: nftTagStatusEnum,
  logs: z
    .array(
      z.object({
        timestamp: z.date(),
        detectionMethod: z.string(),
        details: z.string(),
      }),
    )
    .optional(),
  signature: z.string().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  __v: z.number().optional(),
})
export const nftBeaconSchema = z.object({
  _id: objectIdSchema,
  nftId: objectIdSchema,
  assetId: objectIdSchema.optional(),
  sensorId: z.string(),
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
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  __v: z.number().optional(),
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
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  __v: z.number().optional(),
})
export const mintNFTSchema = z.object({
  nftType: nftTypeEnum,
  nftName: z.string(),
  nftSymbol: z.string(),
  nftDescription: z.string().nullable().optional(),
  nftMedia: z.string().nullable().optional(),
  nftExternalUrl: z.string().nullable().optional(),
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
  collectionId: z.string().optional(),
  creatorAddress: z.string(),
  sellerFeeBasisPoints: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
})
export const verifyNFTSchema = z.object({
  nftId: z.string(),
  assetId: z.string().optional(),
  chipId: z.string(),
  chipType: z.string().optional(),
  chipManufacturer: z.string().optional(),
})
export interface NFTFullResource extends NFTResource {
  physicalAsset?: NFTPhysicalAssetResource | null
  tags?: NFTTagResource[]
  beacons?: (NFTBeaconResource & { readings?: NFTBeaconReadingResource[] })[]
}

export type NFTResource = z.infer<typeof nftSchema>
export type NFTType = z.infer<typeof nftTypeEnum>
export type NFTStatus = z.infer<typeof nftStatusEnum>
export type NFTPhysicalAssetResource = z.infer<typeof nftPhysicalAssetSchema>
export type NFTTagResource = z.infer<typeof nftTagSchema>
export type NFTBeaconResource = z.infer<typeof nftBeaconSchema>
export type NFTBeaconReadingResource = z.infer<typeof nftBeaconReadingSchema>

export type MintNFTResource = z.infer<typeof mintNFTSchema>
export type VerifyNFTResource = z.infer<typeof verifyNFTSchema>
