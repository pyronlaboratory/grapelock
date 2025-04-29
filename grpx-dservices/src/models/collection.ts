import mongoose from 'mongoose'

const CollectionSchema = new mongoose.Schema(
  {
    collectionName: { type: String, required: true },
    collectionSymbol: { type: String, required: true },
    collectionDescription: { type: String },
    collectionUri: { type: String },
    collectionMetadataUri: { type: String },
    creatorAddress: { type: String, required: true },
    creatorShare: { type: Number, required: true, min: 0, max: 100 },
    sellerFee: { type: Number, required: true, min: 0, max: 10000 },
    maxSupply: { type: Number, required: true, min: 0 },
    mintAddress: { type: String },
    metadataAddress: { type: String },
    masterEditionAddress: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'archive'],
      default: 'pending',
    },
    txSignature: { type: String },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
)

export const Collection = mongoose.model('collections', CollectionSchema)
