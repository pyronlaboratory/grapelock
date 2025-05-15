import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
  {
    collectionName: { type: String, required: true },
    collectionSymbol: { type: String, required: true },
    collectionDescription: { type: String },
    collectionMedia: { type: String },
    collectionMetadataUri: { type: String },
    sellerFeeBasisPoints: { type: Number, required: true, min: 0, max: 10000 },
    creatorAddress: { type: String, required: true },
    ownerAddress: { type: String, required: true },
    tokenMintAddress: { type: String },
    tokenAccountAddress: { type: String },
    metadataAccountAddress: { type: String },
    masterEditionAccountAddress: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'published', 'failed', 'archived'],
      default: 'pending',
    },
    signature: { type: String },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
)

export const Collection = mongoose.model('collections', collectionSchema)
