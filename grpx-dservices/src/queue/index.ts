import { Queue } from 'bullmq'
import { getApiConfig } from '../lib/config.js'
import { getApiContext } from '../lib/context.js'

const { redisConnection } = getApiConfig()
const context = await getApiContext()
let factoryQueue: Queue
try {
  factoryQueue = new Queue('factory_queue', {
    connection: {
      url: redisConnection,
      retryStrategy(times) {
        if (times > 0) return null
        return Math.min(times * 200, 2000)
      },
    },
  })
  context.log.info(`🔁 New ${factoryQueue.name} created successfully`)
} catch (error) {
  context.log.error('Failed to connect to Redis:', error)
}

export { factoryQueue }
