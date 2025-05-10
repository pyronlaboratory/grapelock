import { Types } from 'mongoose'
import { getApiContext } from '../lib/context.js'
import { Offer } from '../models/offer.js'
import { CreateOfferResource, OfferResource } from '../types/offer.types.js'
import { NFT } from '../models/nft.js'

const context = await getApiContext()

export async function registerOffer(payload: CreateOfferResource): Promise<OfferResource> {
  try {
    const newOffer = await Offer.create({
      nftId: payload.nftId,
      nftMintAddress: payload.nftMintAddress,
      sellingPrice: payload.sellingPrice,
      producerAddress: payload.producerAddress,
      offerAddress: payload.offerAddress,
      vaultAddress: payload.vaultAddress,
      txSignature: payload.txSignature,
    })

    return newOffer.toObject() as OfferResource
  } catch (error: any) {
    context.log.error('Error saving offer:', error)
    throw new Error(`Failed to register offer: ${error.message}`)
  }
}

export async function getAllOpenVerfifiedOffers(): Promise<OfferResource[]> {
  // Get all open offers
  const openOffers = await Offer.find({ status: 'open' }).lean()

  // Get all unique nftIds from these offers
  const nftIds = openOffers.map((offer) => offer.nftId)

  // Find NFTs that are in circulation
  const inCirculationNFTs = await NFT.find({
    _id: { $in: nftIds },
    status: 'in_circulation',
  }).select('_id')

  const validNftIdSet = new Set(inCirculationNFTs.map((nft) => nft._id.toString()))

  // Filter offers whose nftId is in the valid set
  const filteredOffers = openOffers.filter((offer) => validNftIdSet.has(offer.nftId.toString()))

  return filteredOffers as OfferResource[]
}
