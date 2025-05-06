import mongoose from 'mongoose'

const deviceInfoSchema = new mongoose.Schema({
  type: String,
  id: String,
  ipAddress: String,
  userAgent: String,
})

const locationSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  address: String,
})

const verificationEventSchema = new mongoose.Schema(
  {
    nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'nfts', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'physical_assets' },
    chipId: { type: mongoose.Schema.Types.ObjectId, ref: 'tags' },
    verifierAddress: String,
    timestamp: Date,
    verificationType: String,
    verificationMethod: String,
    result: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'SUSPICIOUS'],
    },
    failureReason: String,
    deviceInfo: deviceInfoSchema,
    location: locationSchema,
    blockchainTxHash: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const VerificationEvent = mongoose.model('verification_events', verificationEventSchema)
