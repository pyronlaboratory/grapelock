import { uploadData } from './irys.js'
import { failCollection } from './collection.js'
import { Collection } from '../models/collection.js'
import { CollectionType } from '../types/collection.types.js'
import { getApiContext } from '../lib/context.js'

const context = await getApiContext()

// TODO:
// Extend to allow minting different catgory types
export async function prepareMetadata(collection: CollectionType): Promise<CollectionType> {
  if (collection.collectionMetadataUri || collection.status !== 'processing') return collection
  const _metadata = {
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
    const metadata = JSON.stringify(_metadata)
    const receipt = await uploadData(metadata)
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
    await failCollection(collection._id.toString(), error.message || 'Unknown error during metadata upload')
    throw new Error('Failed to prepare metadata')
  }
}
