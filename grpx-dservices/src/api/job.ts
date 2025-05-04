import { Router } from 'express'

import { errorResponse, successResponse } from '../lib/helpers.js'
import { CollectionType } from '../types/collection.types.js'
// import { collectionQueue } from '../queue/index.js'
import { Collection } from '../models/collection.js'

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

interface JobResponse {
  jobId: string
  status: JobStatus
  result?: CollectionType // only if status === "completed"
}

const router = Router()

router.get('/collection/:jobId', async (req, res) => {
  try {
    // const job = await collectionQueue.getJob(req.params.jobId)
    // if (!job) {
    //   res.status(404).json(errorResponse('Job not found', 'JOB_NOT_FOUND'))
    //   return
    // }
    // const state = await job.getState()
    // const stateMap: Record<string, JobStatus> = {
    //   waiting: 'queued',
    //   delayed: 'queued',
    //   active: 'processing',
    //   completed: 'completed',
    //   failed: 'failed',
    // }
    // const status: JobStatus = stateMap[state] ?? 'failed'
    // let result: CollectionType | undefined
    // if (status === 'completed') {
    //   console.log(job.returnvalue)
    //   const collectionId = job.returnvalue?.collectionId
    //   const doc = collectionId && (await Collection.findById(collectionId).lean())
    //   result = doc ? ({ ...doc, _id: doc._id.toString() } as CollectionType) : undefined
    // }
    // res.json(successResponse<JobResponse>({ jobId: req.params.jobId, status, result }))
  } catch (error) {
    res.status(500).json(errorResponse('Error fetching job details', 'JOB_LOOKUP_FAILED'))
  }
})

export { router as jobRoute }
