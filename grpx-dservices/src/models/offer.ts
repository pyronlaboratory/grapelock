import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema(
  {
    nftId: { type: String, required: true },
    nftMintAddress: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    producerAddress: { type: String },
    offerAddress: { type: String },
    vaultAddress: { type: String },
    status: {
      type: String,
      enum: ['open', 'close', 'complete', 'failed'],
      default: 'open',
    },
    txSignature: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true },
)

export const Offer = mongoose.model('offers', offerSchema)
