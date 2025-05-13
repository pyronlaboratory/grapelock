// api/index.ts
import express from 'express'
import { clusterRoute } from './cluster.js'
import { blockhashRoute } from './blockhash.js'
import { balanceRoute } from './balance.js'
import { collectionRoute } from './collection.js'
import { nftRoute } from './nft.js'
import { offerRoute } from './offer.js'
import { jobRoute } from './job.js'
import { orderRoute } from './order.js'

const router = express.Router()

// Routes
router.use('/cluster', clusterRoute)
router.use('/blockhash', blockhashRoute)
router.use('/balance', balanceRoute)
router.use('/collections', collectionRoute)
router.use('/nfts', nftRoute)
router.use('/offers', offerRoute)
router.use('/orders', orderRoute)
router.use('/jobs', jobRoute)

export default router
