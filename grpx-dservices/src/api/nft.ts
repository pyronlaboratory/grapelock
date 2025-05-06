// api/nft.ts
import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { validate } from '../middlewares/validate.js'
import { registerNFT } from '../services/nft.js'
import { nftQueue } from '../queue/index.js'
import { NFTResource, mintNFTSchema } from '../types/nft.types.js'

const router = Router()

router.post('/mint', validate(mintNFTSchema), async (req, res) => {
  try {
    const nft: NFTResource = await registerNFT(req.body)
    const job = await nftQueue.add('mint_nft', { id: nft._id }, { attempts: 2 })
    res.status(202).json(successResponse({ data: nft, jobStatus: 'queued', jobId: job.id }))
  } catch (error) {
    res.status(500).json(errorResponse('Error minting nft', 'NFT_MINTING_FAILED'))
  }
})

export { router as nftRoute }
