// // api/collection.ts
import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { getCollection } from '../services/collection.js'
import { getApiContext } from '../lib/context.js'

const router = Router()
const context = await getApiContext()

router.get('/:wallet', async (req, res) => {
  try {
    const collection = await getCollection(req.params.wallet)
    if (!collection || collection.length === 0) {
      res.status(404).json(errorResponse('Collections not found', 'COLLECTIONS_NOT_FOUND'))
      return
    }
    res.json(successResponse(collection))
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching collections', 'COLLECTIONS_ERROR'))
  }
})

router.post('/', async (req, res) => {
  try {
    // const { walletAddress, name, symbol, imageOrMetadata } = req.body
    // Send to background job or immediately process
    // await createCollection(walletAddress, name, symbol, imageOrMetadata)
    res.status(202).json(successResponse({ message: 'Collection creation started.' }))
  } catch (error) {
    res.status(500).json(errorResponse('Error creating collection', 'COLLECTION_CREATION_FAILED'))
  }
})

export { router as collectionRoute }
