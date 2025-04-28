import express from 'express'
import cors from 'cors'

import { default as apiRoutes } from './api/index.js'
import { getApiConfig } from './lib/config.js'
import { getApiContext } from './lib/context.js'
import { errorResponse, successResponse } from './lib/helpers.js'

const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const { port, off_chain_uri, ...config } = getApiConfig()
const context = await getApiContext()

// === EXPRESS SETUP ===
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || config.corsOrigins.includes(origin)) {
        return cb(null, true)
      }
      cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)

// === MONGODB CONNECTION ===
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } }
const connectDb = async () => {
  try {
    await mongoose.connect(off_chain_uri, clientOptions)
    console.log('✅ Connected to MongoDB')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  }
}
await connectDb()
process.on('SIGINT', async () => {
  await mongoose.disconnect()
  console.log('✅ MongoDB disconnected on app termination')
  process.exit(0)
})

// === API Routes ===
app.use('/api/v1', apiRoutes)
app.get('/', (req, res) => {
  res.json(successResponse({ message: 'Welcome to Grpxdservices!' }))
})

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    context.log.warn(`CORS rejection for origin: ${req.headers.origin}`)
    res.status(403).json(errorResponse('Origin not allowed', 'CORS_FORBIDDEN', 403))
    return
  }

  context.log.error(`Unhandled error: ${err.message}`, err)
  res.status(500).json(errorResponse('An unexpected error occurred', 'UNEXPECTED_ERROR'))
})

app.listen(port, () => {
  context.log.info(`🐠 Listening on http://localhost:${port}`)
  context.log.info(`🐠 RPC Endpoint: ${config.solanaRpcEndpoint.split('?')[0]}`)
  context.log.info(`🐠 Signer  : ${context.signer.address}`)
})

declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
