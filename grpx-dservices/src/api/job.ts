import { Router } from 'express'
import { errorResponse, successResponse } from '../lib/helpers.js'
import { getApiContext } from '../lib/context.js'
import { factoryQueue } from '../queue/index.js'
import { stateMap, JobStatus, JobResult } from '../types/job.types.js'
import { CollectionResource } from '../types/collection.types.js'
import { Collection } from '../models/collection.js'
import { NFTResource } from '../types/nft.types.js'
import { NFT } from '../models/nft.js'

const router = Router()
const context = await getApiContext()
router.get('/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId
    const job = await factoryQueue.getJob(jobId)
    if (!job) {
      res.status(404).json(errorResponse('Job not found', 'JOB_NOT_FOUND'))
      return
    }
    const state = await job.getState()
    const status: JobStatus = stateMap[state] ?? 'failed'

    let result: CollectionResource | NFTResource | undefined
    try {
      if (status === 'completed') {
        switch (job.name) {
          case 'create_collection': {
            const collectionId = job.returnvalue.collectionId
            if (collectionId) {
              const doc = await Collection.findById(collectionId).lean()

              if (doc) result = { ...doc, _id: doc._id } as CollectionResource
            }
            break
          }
          case 'mint_nft': {
            const nftId = job.returnvalue.nftId
            if (nftId) {
              const doc = await NFT.findById(nftId).lean()
              if (doc) result = { ...doc, _id: doc._id } as NFTResource
            }
            break
          }
        }
      }
    } catch (error: any) {
      context.log.error(error)
    }
    res.json(
      successResponse<JobResult & Partial<{ result: CollectionResource | NFTResource }>>({
        jobId,
        status,
        result,
      }),
    )
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching job details', 'JOB_LOOKUP_FAILED'))
  }
})

export { router as jobRoute }
