import mongoose from 'mongoose'

const CollectionSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Collection = mongoose.model('collection_nfts', CollectionSchema)
