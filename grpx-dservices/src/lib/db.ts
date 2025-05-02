// src/lib/db.ts
import mongoose, { ConnectOptions } from 'mongoose'
import { getApiConfig } from './config.js'
import { getApiContext } from './context.js'

let connected = false

export async function connectDb() {
  if (connected) return

  const { clusterUri } = getApiConfig()
  const context = await getApiContext()

  const clientOptions: ConnectOptions = {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  }

  try {
    await mongoose.connect(clusterUri, clientOptions)
    context.log.info('🌱 Connected to MongoDB')
    connected = true
  } catch (err) {
    context.log.error('❌ MongoDB connection error:', err)
    process.exit(1)
  } finally {
    process.on('SIGINT', async () => {
      await mongoose.disconnect()
      context.log.info('✅ MongoDB disconnected on app termination')
      process.exit(0)
    })
  }
}
