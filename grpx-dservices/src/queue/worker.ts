// src/queue/worker.ts
import { getApiConfig } from '../lib/config.js'
import { getApiContext } from '../lib/context.js'
import { connectDb } from '../lib/db.js'
import { Worker } from 'bullmq'
import { processCollectionJob } from './processors/create-collection.js'
import { processMintingJob } from './processors/mint-nft.js'

await connectDb()
const { redisConnection } = getApiConfig()
const context = await getApiContext()

const worker = new Worker(
  'factory_queue',
  async (job) => {
    if (job.name === 'create_collection') return await processCollectionJob(job)
    if (job.name === 'mint_nft') return await processMintingJob(job)
  },
  { connection: { url: redisConnection } },
)
const workerId = worker.id || `worker-${Math.random().toString(36).substring(7)}`
context.log.info(`🔥 Worker ${workerId} is ready to pick jobs from factory_queue`)

// Event listeners
worker.on('completed', (job) => {
  context.log.info(`Job ${job.id} completed`)
})
worker.on('failed', (job, err) => {
  context.log.error(`Job ${job?.id} failed:`, err)
})
