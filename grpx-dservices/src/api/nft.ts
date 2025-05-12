// api/nft.ts
import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { validate } from '../middlewares/validate.js'
import { getNFTById, getNFTs, registerNFT } from '../services/nft.js'
import { nftQueue } from '../queue/index.js'
import { NFTResource, mintNFTSchema } from '../types/nft.types.js'

const router = Router()

router.get('/:collectionId', async (req, res) => {
  try {
    const nfts = await getNFTs(req.params.collectionId)

    if (!nfts || nfts.length === 0) {
      res.status(404).json(errorResponse('No NFTs found for this collection', 'NFT_NOT_FOUND'))
      return
    }
    res.status(200).json(successResponse(nfts))
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching nfts', 'NFT_FETCH_ERROR'))
  }
})

router.get('/data/:nftId', async (req, res) => {
  try {
    const nft = await getNFTById(req.params.nftId)
    if (!nft) {
      res.status(404).json(errorResponse('NFT not found', 'NFT_NOT_FOUND'))
      return
    }
    res.status(200).json(successResponse(nft))
  } catch (err) {
    res.status(500).json(errorResponse('Error fetching NFT', 'NFT_FETCH_ERROR'))
  }
})

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
