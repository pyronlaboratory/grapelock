import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  address: String,
  updatedAt: Date,
})

const historySchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  address: String,
  timestamp: Date,
})

const dimensionsSchema = new mongoose.Schema({
  length: Number,
  width: Number,
  height: Number,
  unit: String,
})

const weightSchema = new mongoose.Schema({
  value: Number,
  unit: String,
})

const physicalAssetSchema = new mongoose.Schema(
  {
    nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'nfts', required: true },
    productType: String,
    serialNumber: String,
    manufacturer: String,
    manufactureDate: Date,
    location: {
      current: locationSchema,
      history: [historySchema],
    },
    dimensions: dimensionsSchema,
    weight: weightSchema,
    status: {
      type: String,
      enum: ['MANUFACTURED', 'IN_TRANSIT', 'DELIVERED', 'VERIFIED'],
    },
    containedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'nftPhysicals' }],
  },
  { timestamps: true },
)

export const PhysicalAsset = mongoose.model('rwas', physicalAssetSchema)
