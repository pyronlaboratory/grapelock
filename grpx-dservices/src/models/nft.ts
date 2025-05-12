import mongoose from 'mongoose'

const nftSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'collections',
      required: true,
    },
    batchSize: { type: Number },
    batchType: { type: String },
    nftName: { type: String, required: true },
    nftSymbol: { type: String, required: true },
    nftType: { type: String, enum: ['single', 'batch'], required: true },
    nftDescription: { type: String },
    nftMedia: { type: String },
    nftExternalUrl: { type: String },
    nftMetadataUri: { type: String },
    nftAttributes: [
      {
        trait_type: String,
        value: String,
      },
    ],
    sellerFeeBasisPoints: { type: Number, required: true },
    maxSupply: { type: Number, required: true },
    creatorAddress: { type: String },
    destinationAddress: { type: String },
    mintAddress: { type: String },
    metadataAddress: { type: String },
    masterEditionAddress: { type: String },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'failed',
        'minted',
        'linked',
        'verified',
        'in_circulation',
        'delivered',
        'consumed',
        'cancelled',
        'burned',
      ],
      default: 'pending',
    },
    txSignature: { type: String },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
)

export const NFT = mongoose.model('nfts', nftSchema)
