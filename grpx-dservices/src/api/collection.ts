// api/collection.ts
import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { validate } from '../middlewares/validate.js'
import { getCollections, registerCollection } from '../services/collection.js'
import { collectionQueue } from '../queue/index.js'
import { CollectionResource, createCollectionSchema } from '../types/collection.types.js'

const router = Router()

router.get('/:pubicKey', async (req, res) => {
  try {
    const collections = await getCollections(req.params.pubicKey)
    if (!collections || collections.length === 0) {
      res.status(404).json(errorResponse('Collections not found', 'COLLECTIONS_NOT_FOUND'))
      return
    }
    res.json(successResponse(collections))
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching collections', 'COLLECTIONS_ERROR'))
  }
})
router.post('/', validate(createCollectionSchema), async (req, res) => {
  try {
    const collection: CollectionResource = await registerCollection(req.body)
    const job = await collectionQueue.add('create_collection', { id: collection._id }, { attempts: 2 })
    res.status(202).json(successResponse({ data: collection, jobStatus: 'queued', jobId: job.id }))
  } catch (error) {
    res.status(500).json(errorResponse('Error creating collection', 'COLLECTION_CREATION_FAILED'))
  }
})

export { router as collectionRoute }
