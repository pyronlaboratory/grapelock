// src/queue/worker.ts
import { Worker } from 'bullmq'
import { processCollectionJob } from './processors/collection.js'
import { processMintingJob } from './processors/nft.js'
import { connectDb } from '../lib/db.js'
import { getApiConfig } from '../lib/config.js'
import { getApiContext } from '../lib/context.js'

await connectDb()
const { redisConnection } = getApiConfig()
const context = await getApiContext()

// Builder - Worker for managing collection factory
const builder = new Worker(
  'collection_queue',
  async (job) => {
    if (job.name === 'create_collection') return await processCollectionJob(job)
  },
  { connection: { url: redisConnection } },
)
const workerId = builder.id || `worker-${Math.random().toString(36).substring(7)}`
context.log.info(`🔥 Worker ${workerId} is ready to pick jobs on the 'collection_queue'`)

// Forger - Worker for managing NFT minting
const forger = new Worker(
  'nft_queue',
  async (job) => {
    if (job.name === 'mint_nft') return await processMintingJob(job)
  },
  { connection: { url: redisConnection } },
)
const forgerId = forger.id || `worker-${Math.random().toString(36).substring(7)}`
context.log.info(`🔥 Worker ${forgerId} is ready to pick jobs on the 'collection_queue'`)

// Event listeners
builder.on('completed', (job) => {
  context.log.info(`Job ${job.id} completed`)
})
builder.on('failed', (job, err) => {
  context.log.error(`Job ${job?.id} failed:`, err)
})

forger.on('completed', (job) => {
  context.log.info(`Job ${job.id} completed`)
})
forger.on('failed', (job, err) => {
  context.log.error(`Job ${job?.id} failed:`, err)
})
