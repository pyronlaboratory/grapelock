import { Collection } from '../models/collection.js'
import { CollectionType, CreateCollectionType } from '../types/collection.types.js'
import { getApiContext } from '../lib/context.js'

const context = await getApiContext()

export async function getCollection(wallet: string) {
  return await Collection.find({ creatorAddress: wallet }).lean()
}

export async function registerCollection(payload: CreateCollectionType): Promise<CollectionType> {
  const now = new Date()
  const collection = new Collection({
    ...payload,
    collectionMetadataUri: '',
    status: 'pending',
    mintAddress: '',
    metadataAddress: '',
    masterEditionAddress: '',
    createdAt: now,
    updatedAt: now,
  })

  try {
    await collection.validate()
    await collection.save()
    return collection.toObject()
  } catch (error) {
    context.log.error('Error saving collection:', error)
    throw new Error('Failed to register collection')
  }
}

export async function processCollection(id: string): Promise<CollectionType | undefined> {
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: id },
      { status: 'processing', updatedAt: new Date() },
      { new: true },
    )

    if (!collection) {
      context.log.error('Collection not found or update to processing failed:', id)
    }

    return collection?.toObject()
  } catch (error: any) {
    context.log.error('Error processing collection:', error)
    await failCollection(id.toString(), error.message || 'Unknown error during processing collection')
    throw new Error('Failed to processs collection')
  }
}

export async function failCollection(id: string, message: string) {
  try {
    await Collection.findByIdAndUpdate(id, {
      status: 'failed',
      errorMessage: message,
      updatedAt: new Date(),
    })
  } catch (error) {
    context.log.error('Error updating collection status to fail:', error)
    throw new Error('Failed to update collection status')
  }
}

export async function writeCollection(collection: CollectionType): Promise<string> {
  try {
    // Replace with actual Solana interaction
    const txSignature = 'dummy-solana-tx-id'
    return txSignature
  } catch (error: any) {
    context.log.error('Error writing to Solana:', error)
    await failCollection(collection._id.toString(), error.message || 'Unknown error while writing collection to solana')
    throw new Error('Solana transaction failed')
  }
}

export async function confirmCollection(id: string) {
  try {
    await Collection.findByIdAndUpdate(id, {
      status: 'completed',
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error marking collection as completed:', error)
    await failCollection(id.toString(), error.message || 'Unknown error while confirming collection')
    throw new Error('Failed to confirm collection')
  }
}

export async function deleteCollection() {
  // change status to archived in MongoDB
}

export async function updateCollection() {
  // update collection with collection tx id.etc
}
