// api/nft.ts
import { Router } from 'express'
import { getApiContext } from '../lib/context.js'
import { errorResponse, successResponse } from '../lib/helpers.js'
import { validate } from '../middlewares/validate.js'
import { factoryQueue } from '../queue/index.js'
import { getNFTById, getNFTs, updateNFT, auditNFT, registerNFT, registerTag } from '../services/nft.js'
import { NFTResource, mintNFTSchema, verifyNFTSchema } from '../types/nft.types.js'

const router = Router()
const context = await getApiContext()
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
    const job = await factoryQueue.add('mint_nft', { id: nft._id }, { attempts: 2 })
    res.status(202).json(successResponse({ data: nft, jobStatus: 'queued', jobId: job.id }))
  } catch (error) {
    res.status(500).json(errorResponse('Error minting nft', 'NFT_MINTING_FAILED'))
  }
})

// Ideally should validate physical asset entry in off-chain storage
router.post('/verify', validate(verifyNFTSchema), async (req, res) => {
  try {
    const signature = await auditNFT(req.body)
    const tag = await registerTag(req.body, signature)
    if (!tag || tag.status !== 'active') throw new Error('Failed to register tag')

    const verified = await updateNFT(req.body.nftId, { status: 'verified', signature })
    if (verified.status !== 'verified') throw new Error('Failed to mark nft as verified')
    res.status(200).json(successResponse(verified))
  } catch (error) {
    res.status(500).json(errorResponse('Error verifying nft', 'NFT_VERIFICATION_FAILED'))
  }
})

export { router as nftRoute }
