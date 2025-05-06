import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { collectionQueue, nftQueue } from '../queue/index.js'
import { CollectionResource } from '../types/collection.types.js'
import { NFTResource } from '../types/nft.types.js'
import { Collection } from '../models/collection.js'
import { NFT } from '../models/nft.js'

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

interface JobResponse {
  jobId: string
  status: JobStatus
  result?: CollectionResource | NFTResource // only if status === "completed"
}

const router = Router()

router.get('/collection/:jobId', async (req, res) => {
  try {
    const job = await collectionQueue.getJob(req.params.jobId)
    if (!job) {
      res.status(404).json(errorResponse('Job not found', 'JOB_NOT_FOUND'))
      return
    }
    const state = await job.getState()
    const stateMap: Record<string, JobStatus> = {
      waiting: 'queued',
      delayed: 'queued',
      active: 'processing',
      completed: 'completed',
      failed: 'failed',
    }
    const status: JobStatus = stateMap[state] ?? 'failed'
    let result: CollectionResource | undefined
    if (status === 'completed') {
      console.log(job.returnvalue)
      const collectionId = job.returnvalue?.collectionId
      const doc = collectionId && (await Collection.findById(collectionId).lean())
      result = doc ? ({ ...doc, _id: doc._id.toString() } as CollectionResource) : undefined
    }
    res.json(successResponse<JobResponse>({ jobId: req.params.jobId, status, result }))
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching job details', 'JOB_LOOKUP_FAILED'))
  }
})

router.get('/nft/:jobId', async (req, res) => {
  try {
    const job = await nftQueue.getJob(req.params.jobId)
    if (!job) {
      res.status(404).json(errorResponse('Job not found', 'JOB_NOT_FOUND'))
      return
    }
    const state = await job.getState()
    const stateMap: Record<string, JobStatus> = {
      waiting: 'queued',
      delayed: 'queued',
      active: 'processing',
      completed: 'completed',
      failed: 'failed',
    }
    const status: JobStatus = stateMap[state] ?? 'failed'
    let result: NFTResource | undefined
    if (status === 'completed') {
      console.log(job.returnvalue)
      const nftId = job.returnvalue
      const doc = nftId && (await NFT.findById(nftId).lean())
      result = doc ? ({ ...doc, _id: doc._id.toString() } as NFTResource) : undefined
    }
    res.json(successResponse<JobResponse>({ jobId: req.params.jobId, status, result }))
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching job details', 'JOB_LOOKUP_FAILED'))
  }
})

export { router as jobRoute }
