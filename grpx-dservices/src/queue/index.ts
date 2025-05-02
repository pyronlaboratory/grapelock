import { Queue } from 'bullmq'
import { getApiConfig } from '../lib/config.js'
import { getApiContext } from '../lib/context.js'

const { redisConnection } = getApiConfig()
const context = await getApiContext()

const collectionQueue = new Queue('collection_queue', { connection: { url: redisConnection } })
context.log.info(`⏳ New ${collectionQueue.name} created successfully`)

export { collectionQueue }
