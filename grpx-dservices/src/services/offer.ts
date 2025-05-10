import { Types } from 'mongoose'
import { getApiContext } from '../lib/context.js'
import { Offer } from '../models/offer.js'
import { CreateOfferResource, OfferResource } from '../types/offer.types.js'

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
