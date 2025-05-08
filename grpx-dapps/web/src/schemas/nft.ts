import { z } from 'zod'
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
  message: '_id must be a 24-char hex string',
})
export const nftTypeEnum = z.enum(['single', 'batch'])

export const nftStatusEnum = z.enum([
  'pending', // NFT is registered but not yet minted
  'processing', // Job is actively minting or validating
  'failed', // Minting/processing error
  'minted', // Successfully minted but no physical linkage yet
  'linked', // Linked to a physical asset
  'verified', // IoT sensors/tags are active and authenticated
  'in_circulation', // Actively moving through supply chain (optional state to signal it's in use)
  'delivered', // Reached final recipient (end consumer)
  'consumed', // Physically used, e.g., eaten, installed, etc.
  'cancelled', // Invalidated by producer/admin (e.g., recall or tamper)
  'burned', // NFT is permanently destroyed
])
export const nftPhysicalAssetStatusEnum = z.enum([
  'unlinked', // Asset not yet linked to any NFT
  'linked', // Linked but not verified (no sensors or inactive)
  'verified', // At least one valid sensor/tag is active
  'degraded', // One or more sensors/tags are failing or tampered
  'in_transit', // Optionally track shipment phase
  'delivered', // Reached final recipient
  'consumed', // Physically used, e.g. eaten or installed
  'cancelled', // Marked invalid (recall, tampering, etc.)
])
export const nftTagStatusEnum = z.enum([
  'inactive', // Not initialized or used yet
  'active', // Functioning and verified
  'tampered', // Physical or cryptographic tamper detected
  'deactivated', // Manually or automatically turned off
  'decommissioned', // End-of-life, retired from use
])
export const nftBeaconStatusEnum = z.enum([
  'inactive', // Registered but not transmitting yet
  'active', // Online, transmitting data within expected range
  'low_battery', // Battery below threshold
  'offline', // No signal / not reporting
  'error', // Data out of spec or hardware error
  'maintenance', // In calibration or update
  'decommissioned', // Retired or replaced
])
export const nftSchema = z.object({
  _id: objectIdSchema, // from MongoDB
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
  creatorAddress: z.string().optional(),
  sellerFeeBasisPoints: z.number().min(0).max(10000),
  maxSupply: z.number().min(0),
  status: nftStatusEnum,
  mintAddress: z.string().nullable().optional(),
  metadataAddress: z.string().nullable().optional(),
  masterEditionAddress: z.string().nullable().optional(),
  txSignature: z.string().nullable().optional(),
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
  maxSupply: z.coerce.number().min(0, 'Max supply must be 0 or greater'),
})
export type NFTType = z.infer<typeof nftTypeEnum>
export type NFTResource = z.infer<typeof nftSchema>
export type MintNFTFormResource = z.infer<typeof mintNFTFormSchema>
