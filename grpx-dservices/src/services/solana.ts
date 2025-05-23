import { LRUCache } from 'lru-cache'
import { Blockhash, assertIsAddress, getMonikerFromGenesisHash, lamportsToSol } from 'gill'
import { ApiContext } from '../lib/context.js'
import { PublicKey } from '@solana/web3.js'

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

export async function getSolanaCluster({ client }: ApiContext) {
  const genesis = await client.rpc.getGenesisHash().send()
  const cluster = getMonikerFromGenesisHash(genesis)

  return { cluster, genesis }
}

// We use a cache to avoid hitting the RPC endpoint too often.
// See https://solana.stackexchange.com/a/9860/98 for more details.
const cache = new LRUCache<
  string,
  { blockhash: Blockhash; lastValidBlockHeight: bigint; cachedAt: number },
  ApiContext
>({
  max: 1,
  // 30 seconds
  ttl: 1000 * 30,
  // Define the fetch method for this cache
  fetchMethod: async (_key, _value, { context }) => {
    const latestBlockhash = await context.client.rpc
      .getLatestBlockhash()
      .send()
      .then((res) => res.value)

    context.log.debug(`[getSolanaCachedBlockhash] cache write blockhash ${latestBlockhash.blockhash}`)
    return { ...latestBlockhash, cachedAt: Date.now() }
  },
})

export async function getSolanaCachedBlockhash(context: ApiContext) {
  return await cache.fetch('latest-blockhash', { context })
}

export async function getSolanaBalance({ client }: ApiContext, address: string) {
  assertIsAddress(address)
  const balance = await client.rpc
    .getBalance(address)
    .send()
    .then((res) => res.value)

  return {
    address,
    balance: `${lamportsToSol(balance)} SOL`,
  }
}

// Metadata and Master edition accounts
export const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0]
}
export const getMasterEdition = async (mint: PublicKey): Promise<PublicKey> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
    TOKEN_METADATA_PROGRAM_ID,
  )[0]
}
