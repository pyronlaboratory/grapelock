import { Collection } from '../models/collection.js'

export async function getCollection(wallet: string) {
  return await Collection.find({ owner: wallet }).lean()
}
