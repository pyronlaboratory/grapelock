import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
  {
    collectionName: { type: String, required: true },
    collectionSymbol: { type: String, required: true },
    collectionDescription: { type: String },
    collectionMedia: { type: String },
    collectionMetadataUri: { type: String },
    creatorAddress: { type: String, required: true },
    sellerFeeBasisPoints: { type: Number, required: true, min: 0, max: 10000 },
    maxSupply: { type: Number, required: true, min: 0 },
    destinationAddress: { type: String },
    mintAddress: { type: String },
    metadataAddress: { type: String },
    masterEditionAddress: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'published', 'failed', 'archived'],
      default: 'pending',
    },
    txSignature: { type: String },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
)

export const Collection = mongoose.model('collections', collectionSchema)
