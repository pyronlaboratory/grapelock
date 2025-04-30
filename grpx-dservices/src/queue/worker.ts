// src/queue/worker.ts
import { Worker } from 'bullmq'
import { process } from './processors/collection.js'

import { getApiConfig } from '../lib/config.js'
import { getApiContext } from '../lib/context.js'

const { redisConnection } = getApiConfig()
const context = await getApiContext()

const collectionWorker = new Worker(
  'collection',
  async (job) => {
    if (job.name === 'create') return await process(job)
  },
  { connection: { url: redisConnection } },
)

// Event listeners
collectionWorker.on('completed', (job) => {
  context.log.info(`Job ${job.id} completed`)
})
collectionWorker.on('failed', (job, err) => {
  context.log.error(`Job ${job?.id} failed:`, err)
})
