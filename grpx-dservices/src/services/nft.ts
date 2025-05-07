import { NFT } from '../models/nft.js'
import {
  FullNFTResource,
  MintNFTResource,
  NFTBeaconReadingResource,
  NFTBeaconResource,
  NFTPhysicalAssetResource,
  NFTResource,
  nftSchema,
  NFTTagResource,
  objectIdSchema,
} from '../types/nft.types.js'
import { getApiContext } from '../lib/context.js'
import mongoose, { Types } from 'mongoose'
import { PhysicalAsset } from '../models/physical_asset.js'
import { Tag } from '../models/tags.js'
import { Beacon } from '../models/beacon.js'
import { BeaconReading } from '../models/beacon_reading.js'

const context = await getApiContext()

/**
 * Given an NFT ID, retrieves the associated collection mint address.
 * @param nftId - The MongoDB ObjectId of the NFT document.
 * @returns The collection's mint address as a string.
 */
export async function getCollectionMintAddressForNFT(nftId: string): Promise<string> {
  if (!mongoose.Types.ObjectId.isValid(nftId)) {
    throw new Error('Invalid NFT ID format')
  }

  const nft = await NFT.findById(nftId).populate('collectionId').exec()

  if (!nft) {
    throw new Error('NFT not found')
  }

  const collection = nft.collectionId as any

  if (!collection || !collection.mintAddress) {
    throw new Error('Associated collection or its mintAddress not found')
  }

  return collection.mintAddress
}

export async function getNFTs(collectionId: string) {
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new Error('Invalid Collection ID format')
  }

  return await NFT.find({ collectionId }).lean()
}

export async function getNFTById(nftId: string): Promise<FullNFTResource | null> {
  if (!mongoose.Types.ObjectId.isValid(nftId)) {
    throw new Error('Invalid NFT ID format')
  }

  const nft = await NFT.findById(nftId).lean()
  if (!nft) return null

  const [physicalAsset, tags, beacons] = await Promise.all([
    PhysicalAsset.findOne({ nftId: nftId }).lean() as Promise<NFTPhysicalAssetResource | null>,
    Tag.find({ productId: nftId }).lean() as Promise<NFTTagResource[]>,
    Beacon.find({ productId: nftId }).lean() as Promise<NFTBeaconResource[]>,
  ])

  const beaconsWithReadings = await Promise.all(
    (beacons || []).map(async (beacon: NFTBeaconResource) => {
      const readings = (await BeaconReading.find({
        sensorId: beacon._id,
      }).lean()) as Required<NFTBeaconReadingResource>[]
      return { ...beacon, readings }
    }),
  )

  return {
    ...nft,
    nftAttributes: (nft.nftAttributes || [])
      .filter((attr) => attr.trait_type && attr.value)
      .map((attr) => ({
        trait_type: attr.trait_type as string,
        value: attr.value as string,
      })),
    physicalAsset: physicalAsset || null,
    tags: tags || [],
    beacons: beaconsWithReadings || [],
  }
}

export async function registerNFT(payload: MintNFTResource): Promise<NFTResource> {
  try {
    const nft = await NFT.create({
      ...payload,
      status: 'pending',
      mintAddress: null,
      metadataAddress: null,
      masterEditionAddress: null,
      txSignature: null,
      errorMessage: null,
    })
    const nftObject = nft.toObject()
    const parsedNFT = nftSchema.parse(nftObject)

    return parsedNFT
  } catch (error) {
    context.log.error('Error saving nft mint data:', error)
    throw new Error('Failed to mint nft')
  }
}

export async function processNFT(id: string): Promise<NFTResource | undefined> {
  const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null
  if (!objectId) throw new Error('Invalid nft ID')

  try {
    const nft = await NFT.findOneAndUpdate(
      { _id: objectId },
      { status: 'processing', updatedAt: new Date() },
      { new: true },
    )

    if (!nft) {
      context.log.error('NFT not found or update to processing failed:', id)
    }

    return nft?.toObject() as NFTResource
  } catch (error: any) {
    context.log.error('Error processing nft:', error)
    throw new Error('Failed to processs nft')
  }
}

export async function updateNFT(id: string, updates: Partial<NFTResource>) {
  try {
    await NFT.findByIdAndUpdate(id, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error updating nft:', error)
    throw new Error('Failed to update nft data')
  }
}

export async function confirmNFT(id: string) {
  try {
    await NFT.findByIdAndUpdate(id, {
      status: 'minted',
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error marking nft as minted:', error)
    throw new Error('Failed to confirm nft minting')
  }
}

export async function failNFT(id: string, message: string) {
  try {
    await NFT.findByIdAndUpdate(id, {
      status: 'failed',
      errorMessage: message,
      updatedAt: new Date(),
    })
  } catch (error) {
    context.log.error('Error updating minting status to fail:', error)
    throw new Error('Failed to update minting status')
  }
}

// export async function deleteNFT() {
//   return undefined
// }
