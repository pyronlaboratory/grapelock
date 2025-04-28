// api/blockhash.ts
import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { getSolanaCachedBlockhash } from '../services/solana.js'
import { getApiContext } from '../lib/context.js'

const router = Router()
const context = await getApiContext()

router.get('/latest', async (req, res) => {
  try {
    const start = Date.now()
    const blockhash = await getSolanaCachedBlockhash(context)

    if (!blockhash) {
      context.log.error(`Failed to retrieve blockhash`)
      res.status(500).json(errorResponse('Blockhash not retrieved', 'BLOCKHASH_RETRIEVAL_FAILED'))
      return
    }

    res.json(
      successResponse({
        ...blockhash,
        ttl: blockhash.cachedAt + 1000 * 30 - Date.now(),
        duration: Date.now() - start + 'ms',
      }),
    )
  } catch (error) {
    context.log.error(`Error getting blockhash`, error)
    res.status(500).json(errorResponse('Error getting blockhash', 'BLOCKHASH_ERROR'))
  }
})

export { router as blockhashRoute }
