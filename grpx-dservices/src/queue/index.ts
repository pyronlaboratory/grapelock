import { Queue } from 'bullmq'
import { getApiConfig } from '../lib/config.js'
import { getApiContext } from '../lib/context.js'

const { redisConnection } = getApiConfig()
const context = await getApiContext()

const collectionQueue = new Queue('collection', { connection: { url: redisConnection } })
context.log.info(`⏳ New Queue ${collectionQueue.name} created successfully`)

export { collectionQueue }
