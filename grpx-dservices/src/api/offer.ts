// api/offer.ts
import { Router } from 'express'
import { errorResponse, successResponse } from '../lib/helpers.js'
import { validate } from '../middlewares/validate.js'
import { createOfferSchema, OfferResource, updateOfferSchema } from '../types/offer.types.js'
import { registerOffer, updateOffer, getOfferById, getAllOpenVerfifiedOffers } from '../services/offer.js'
import { updateNFT } from '../services/nft.js'
import { createOrder } from '../services/order.js'

const router = Router()

router.get('/:id', async (req, res) => {
  try {
    const offer = await getOfferById(req.params.id)
    res.status(200).json(successResponse({ data: offer }))
  } catch (error) {
    res.status(500).json(errorResponse(`Error fetching details for offer id: ${req.params.id}`, 'OFFER_ERROR'))
  }
})

router.get('/', async (req, res) => {
  try {
    const offers = await getAllOpenVerfifiedOffers()
    res.status(200).json(successResponse({ data: offers }))
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching offers', 'OFFERS_ERROR'))
  }
})

router.post('/', validate(createOfferSchema), async (req, res) => {
  try {
    const offer: OfferResource = await registerOffer(req.body)
    if (offer.status === 'open') updateNFT(offer.nftId, { status: 'in_circulation' })

    res.status(202).json(successResponse({ data: offer }))
  } catch (error) {
    res.status(500).json(errorResponse('Error creating offer', 'OFFER_CREATION_FAILED'))
  }
})

router.patch('/:id', validate(updateOfferSchema), async (req, res) => {
  try {
    console.log('Request Body:', req.body)

    const offer: OfferResource = await updateOffer(req.params.id, req.body)
    console.log('Updated Offer:', offer)

    if (!offer.consumer) {
      console.error('Missing order creation resource: Offer does not have a consumer')
      throw new Error('Missing order creation resource')
    }

    if (offer.status === 'in_progress') {
      try {
        const order = await createOrder({
          offerId: offer._id.toString(),
          producerPublicKey: offer.producer,
          consumerPublicKey: offer.consumer,
        })

        if (!order) {
          console.error(`Failed to create order for offer ID: ${offer._id.toString()}`)
          throw new Error(`Failed to create order for offer ID: ${offer._id.toString()}`)
        }

        res.status(202).json(successResponse({ data: order }))
      } catch (error: any) {
        console.error('Order creation failed:', error.message)
        res.status(500).json(errorResponse('Order creation failed', 'ORDER_CREATION_FAILED'))
      }
    } else {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OFFER_STATUS',
          message: 'Offer status must be "in_progress" to create an order',
        },
      })
    }
  } catch (error: any) {
    console.error('Error updating offer:', error.message)
    res.status(500).json(errorResponse('Error updating offer', 'OFFER_UPDATE_FAILED'))
  }
})

export { router as offerRoute }
