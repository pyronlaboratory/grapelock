import { getApiContext } from '../lib/context.js'
import { Offer } from '../models/offer.js'
import { CreateOfferResource, OfferResource, OfferWithNFTDetails } from '../types/offer.types.js'
import { NFT } from '../models/nft.js'

const context = await getApiContext()

export async function getAllOpenVerfifiedOffers(): Promise<OfferWithNFTDetails[]> {
  const openOffers = await Offer.find({ status: ['open'] }).lean()
  const nftIds = openOffers.map((offer) => offer.nftId)
  const inCirculationNFTs = await NFT.find({
    _id: { $in: nftIds },
    status: 'in_circulation',
  }).lean()

  const nftMap = new Map(inCirculationNFTs.map((nft) => [nft._id.toString(), nft]))

  const filteredOffers = openOffers
    .filter((offer) => nftMap.has(offer.nftId.toString()))
    .map((offer) => {
      const nft = nftMap.get(offer.nftId.toString())
      return {
        ...offer,
        nft,
      }
    })

  return filteredOffers as OfferWithNFTDetails[]
}

export async function getOfferById(id: string): Promise<OfferResource> {
  const offer = await Offer.findOne({ _id: id }).lean()
  if (!offer) throw new Error('Offer not found')

  return offer as OfferResource
}

export async function registerOffer(payload: CreateOfferResource): Promise<OfferResource> {
  try {
    const newOffer = await Offer.create({
      offer: payload.offer,
      nftId: payload.nftId,
      sellingPrice: payload.sellingPrice,
      producer: payload.producer,
      tokenMintA: payload.tokenMintA,
      tokenMintB: payload.tokenMintB,
      vaultTokenAccountA: payload.vaultTokenAccountA,
      vaultTokenAccountB: payload.vaultTokenAccountB,
      txSignature: payload.txSignature,
    })

    return newOffer.toObject() as OfferResource
  } catch (error: any) {
    context.log.error('Error saving offer:', error)
    throw new Error(`Failed to register offer: ${error.message}`)
  }
}

export async function updateOffer(id: string, payload: Partial<OfferResource>): Promise<OfferResource> {
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      {
        consumer: payload.consumer,
        txSignature: payload.txSignature,
        status: payload.status,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedOffer) {
      context.log.error('Offer not found or update failed:', id)
      throw new Error('Offer not found or update failed')
    }

    return updatedOffer.toObject() as OfferResource
  } catch (error: any) {
    context.log.error('Error updating offer:', error)
    throw new Error(`Failed to update offer: ${error.message}`)
  }
}
