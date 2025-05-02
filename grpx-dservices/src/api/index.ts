// api/index.ts
import express from 'express'
import { clusterRoute } from './cluster.js'
import { blockhashRoute } from './blockhash.js'
import { balanceRoute } from './balance.js'
import { collectionRoute } from './collection.js'
import { jobRoute } from './job.js'

const router = express.Router()

// Routes
router.use('/cluster', clusterRoute)
router.use('/blockhash', blockhashRoute)
router.use('/balance', balanceRoute)
router.use('/collections', collectionRoute)
router.use('/jobs', jobRoute)

export default router
