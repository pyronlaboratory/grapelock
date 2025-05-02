// src/queue/worker.ts
import { Worker } from 'bullmq'
import { process } from './processors/collection.js'
import { connectDb } from '../lib/db.js'
import { getApiConfig } from '../lib/config.js'
import { getApiContext } from '../lib/context.js'

await connectDb()
const { redisConnection } = getApiConfig()
const context = await getApiContext()
const collectionWorker = new Worker(
  'collection_queue',
  async (job) => {
    if (job.name === 'create_collection') return await process(job)
  },
  { connection: { url: redisConnection } },
)
const workerId = collectionWorker.id || `worker-${Math.random().toString(36).substring(7)}`
context.log.info(`🔥 Worker ${workerId} is ready to pick jobs on the 'collection_queue'`)

// Event listeners
collectionWorker.on('completed', (job) => {
  context.log.info(`Job ${job.id} completed`)
})
collectionWorker.on('failed', (job, err) => {
  context.log.error(`Job ${job?.id} failed:`, err)
})
