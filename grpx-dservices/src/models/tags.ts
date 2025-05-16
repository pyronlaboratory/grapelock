import mongoose from 'mongoose'

const logsSchema = new mongoose.Schema({
  timestamp: Date,
  detectionMethod: String,
  details: String,
})

const tagSchema = new mongoose.Schema(
  {
    nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'nfts', required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'physical_assets' },
    chipId: { type: String, required: true },
    chipType: String,
    chipManufacturer: String,
    activationDate: Date,
    lastVerifiedAt: Date,
    verificationCount: Number,
    status: {
      type: String,
      enum: ['inactive', 'active', 'tampered', 'deactivated', 'decommissioned'],
    },
    logs: [logsSchema],
    signature: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true },
)

export const Tag = mongoose.model('tags', tagSchema)
