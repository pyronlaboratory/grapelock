// api/offer.ts
import { Router } from 'express'
import { errorResponse, successResponse } from '../lib/helpers.js'
import { validate } from '../middlewares/validate.js'
import { createOfferSchema, OfferResource } from '../types/offer.types.js'
import { registerOffer } from '../services/offer.js'
import { updateNFT } from '../services/nft.js'

const router = Router()

// TODO: Return all offers getOpenOffers()
router.get('/', async (req, res) => {})

router.post('/', validate(createOfferSchema), async (req, res) => {
  try {
    const offer: OfferResource = await registerOffer(req.body)
    if (offer.status === 'open') updateNFT(offer.nftId, { status: 'in_circulation' })
    res.status(202).json(successResponse({ data: offer }))
  } catch (error) {
    res.status(500).json(errorResponse('Error creating offer', 'OFFER_CREATION_FAILED'))
  }
})

export { router as offerRoute }
