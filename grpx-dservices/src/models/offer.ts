import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema(
  {
    offer: { type: String, required: true },
    nftId: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    producer: { type: String, required: true },
    consumer: { type: String },
    tokenMintA: { type: String, required: true },
    tokenMintB: { type: String, required: true },
    vaultTokenAccountA: { type: String, required: true },
    vaultTokenAccountB: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'close', 'complete', 'failed'],
      default: 'open',
    },
    txSignature: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true },
)

export const Offer = mongoose.model('offers', offerSchema)
