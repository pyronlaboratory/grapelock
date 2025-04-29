// src/queue/worker.ts
import { Worker } from 'bullmq'
import { processCollectionJob } from './processors/collection.js'

import { getApiConfig } from '../lib/config.js'
import { getApiContext } from '../lib/context.js'

const { redisConnection } = getApiConfig()
const context = await getApiContext()

const collectionWorker = new Worker(
  'collection',
  async (job) => {
    if (job.name === 'create') return await processCollectionJob(job.data)
  },
  { connection: { url: redisConnection } },
)
collectionWorker.on('completed', (job) => {
  context.log.info(`Job ${job.id} completed`)
  context.log.info(job.returnvalue)
  context.log.info(JSON.stringify(job))
})
collectionWorker.on('failed', (job, err) => {
  context.log.error(`Job ${job?.id} failed:`, err)
})
