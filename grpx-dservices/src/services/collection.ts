import { Collection } from '../models/collection.js'
import { CreateCollectionType } from '../types/collection.types.js'
import { getApiContext } from '../lib/context.js'

const context = await getApiContext()

export async function getCollection(wallet: string) {
  return await Collection.find({ owner: wallet }).lean()
}

export async function registerCollection(payload: CreateCollectionType) {
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

export async function processCollection() {
  // change status to processing in MongoDB
}

export async function writeCollection() {
  // createCollectionOnSolana
}

export async function confirmCollection() {
  // change status to completed in MongoDB
}

export async function failCollection() {
  // change status to failed in MongoDB
}

export async function deleteCollection() {
  // change status to archived in MongoDB
}

export async function updateCollection() {
  // update collection with collection tx id.etc
}
