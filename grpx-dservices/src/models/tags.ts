import mongoose from 'mongoose'

const tamperHistorySchema = new mongoose.Schema({
  timestamp: Date,
  detectionMethod: String,
  details: String,
})

const tagSchema = new mongoose.Schema(
  {
    chipId: { type: String, required: true },
    chipType: String,
    manufacturer: String,
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'physical_assets', required: true },
    activationDate: Date,
    publicKey: String,
    lastVerifiedAt: Date,
    verificationCount: Number,
    status: {
      type: String,
      enum: ['ACTIVE', 'TAMPERED', 'DEACTIVATED'],
    },
    tamperHistory: [tamperHistorySchema],
  },
  { timestamps: true },
)

export const Tag = mongoose.model('tags', tagSchema)
