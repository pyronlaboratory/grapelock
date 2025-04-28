// api/cluster.ts
import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { getSolanaCluster } from '../services/solana.js'
import { getApiContext } from '../lib/context.js'

const router = Router()
const context = await getApiContext()

router.get('/', async (req, res) => {
  try {
    const result = await getSolanaCluster(context)
    if (!result) {
      context.log.error(`Failed to retrieve cluster`)
      res.status(500).json(errorResponse('Cluster not retrieved', 'CLUSTER_RETRIEVAL_FAILED'))
      return
    }
    res.json(successResponse(result))
  } catch (error) {
    context.log.error(`Error getting cluster`, error)
    res.status(500).json(errorResponse('Error getting cluster', 'CLUSTER_ERROR'))
  }
})

export { router as clusterRoute }
