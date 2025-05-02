import 'dotenv/config'
import { z } from 'zod'

const ApiConfigSchema = z.object({
  corsOrigins: z.array(z.string()),
  apiPort: z.coerce.number().int().positive(),
  solanaRpcEndpoint: z.string(),
  solanaSignerPath: z.string(),
  clusterUri: z.string(),
  database: z.string(),
  redisConnection: z.string(),
})

export type ApiConfig = z.infer<typeof ApiConfigSchema>

let config: ApiConfig | undefined

export function getApiConfig(): ApiConfig {
  if (config) return config

  config = ApiConfigSchema.parse({
    corsOrigins: process.env.CORS_ORIGINS?.split(',') ?? [],
    solanaRpcEndpoint: process.env.SOLANA_RPC_ENDPOINT ?? 'devnet',
    solanaSignerPath: process.env.SOLANA_SIGNER_PATH ?? '~/.config/solana/id.json',
    apiPort: process.env.API_PORT ?? 3000,
    clusterUri: process.env.MONGODB_CLUSTER_URI,
    database: process.env.MONGODB_DATABASE,
    redisConnection: process.env.REDIS_URL,
  })
  return config
}
