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
    nftSymbol: { type: String },
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
    creatorAddress: { type: String },
    ownerAddress: { type: String },
    tokenAccountAddress: { type: String },
    tokenMintAddress: { type: String },
    metadataAccountAddress: { type: String },
    masterEditionAccountAddress: { type: String },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'failed',
        'minted',
        'verified',
        'in_circulation',
        'primary_sale_happened',
        'consumed',
        'cancelled',
        'burned',
      ],
      default: 'pending',
    },
    signature: { type: String },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  },
)

export const NFT = mongoose.model('nfts', nftSchema)
