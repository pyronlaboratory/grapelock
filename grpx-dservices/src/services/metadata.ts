import { uploadData } from './irys.js'
import { Collection } from '../models/collection.js'
import { CollectionType } from '../types/collection.types.js'
import { getApiContext } from '../lib/context.js'
export interface Metadata {
  name: string
  description: string
  image: string // URI to image already uploaded
  category: 'image'
  external_url: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties: {
    files: Array<{
      uri: string
      type: string
    }>
  }
}
const context = await getApiContext()

// TODO:
// Extend to allow minting different catgory types
export async function prepareMetadata(collection: CollectionType): Promise<CollectionType> {
  if (collection.collectionMetadataUri || collection.status !== 'processing') return collection

  const _metadata: Metadata = {
    name: collection.collectionName,
    description: collection.collectionDescription || '',
    image: collection.collectionMedia || '', // URI to image already uploaded
    category: 'image',
    external_url: '',
    attributes: [
      {
        trait_type: 'Creator Share',
        value: `${collection.creatorShare}%`,
      },
      {
        trait_type: 'Max Supply',
        value: collection.maxSupply,
      },
    ],
    properties: {
      files: [
        {
          uri: collection.collectionMedia || '',
          type: 'image/png',
        },
      ],
    },
  }

  try {
    const receipt = await uploadData(JSON.stringify(_metadata))
    const metadataUri = receipt ? `https://gateway.irys.xyz/${receipt?.id}` : ''
    const updatedCollection = await Collection.findByIdAndUpdate(
      collection._id,
      {
        collectionMetadataUri: metadataUri,
        updatedAt: new Date(),
      },
      { new: true },
    )

    return updatedCollection!.toObject() as CollectionType
  } catch (error: any) {
    context.log.error('Error preparing metadata:', error)
    throw new Error('Failed to prepare metadata')
  }
}
