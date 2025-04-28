// api/balance.ts
import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { getSolanaBalance } from '../services/solana.js'
import { getApiContext } from '../lib/context.js'

const router = Router()
const context = await getApiContext()

router.get('/signer', async (req, res) => {
  try {
    const balance = await getSolanaBalance(context, context.signer.address)
    if (!balance) {
      context.log.error(`Failed to retrieve balance for signer: ${context.signer.address}`)
      res.status(500).json(errorResponse('Balance not retrieved', 'BALANCE_RETRIEVAL_FAILED'))
      return
    }
    res.json(successResponse(balance))
  } catch (error) {
    context.log.error(`Error getting balance for signer ${context.signer.address}`, error)
    res.status(500).json(errorResponse('Error getting balance', 'BALANCE_ERROR'))
  }
})

router.get('/:address', async (req, res) => {
  try {
    const balance = await getSolanaBalance(context, req.params.address)
    if (!balance) {
      context.log.error(`Failed to retrieve balance for address: ${req.params.address}`)
      res.status(404).json(errorResponse('Balance not found', 'BALANCE_NOT_FOUND'))
      return
    }
    res.json(successResponse(balance))
  } catch (error) {
    context.log.error(`Error getting balance for address ${req.params.address}`, error)
    res.status(500).json(errorResponse('Error retrieving balance', 'BALANCE_ERROR'))
  }
})

export { router as balanceRoute }
