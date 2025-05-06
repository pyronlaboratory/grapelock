import { Types } from 'mongoose'
import { Collection } from '../models/collection.js'
import { CollectionResource, CreateCollectionResource } from '../types/collection.types.js'
import { getApiContext } from '../lib/context.js'

const context = await getApiContext()

export async function getCollection(publicKey: string) {
  return await Collection.find({ creatorAddress: publicKey }).lean()
}

export async function registerCollection(payload: CreateCollectionResource): Promise<CollectionResource> {
  try {
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

    await collection.validate()
    await collection.save()
    return collection.toObject()
  } catch (error) {
    context.log.error('Error saving collection:', error)
    throw new Error('Failed to register collection')
  }
}
export async function processCollection(id: string | Types.ObjectId): Promise<CollectionResource | undefined> {
  const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null
  if (!objectId) throw new Error('Invalid collection ID')

  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: objectId },
      { status: 'processing', updatedAt: new Date() },
      { new: true },
    )

    if (!collection) {
      context.log.error('Collection not found or update to processing failed:', id)
    }

    return collection?.toObject()
  } catch (error: any) {
    context.log.error('Error processing collection:', error)
    throw new Error('Failed to processs collection')
  }
}
export async function updateCollection(id: string, updates: Partial<CollectionResource>) {
  try {
    await Collection.findByIdAndUpdate(id, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error updating collection:', error)
    throw new Error('Failed to update collection data')
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
    throw new Error('Failed to confirm collection')
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
export async function deleteCollection() {
  // change status to archived in MongoDB
}
