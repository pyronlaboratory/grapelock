import { Job } from 'bullmq'
import { getApiContext } from '../../lib/context.js'
import {
  publishCollection,
  failCollection,
  processCollection,
  updateCollection,
  dispatch,
} from '../../services/collection.js'
import { prepareMetadata } from '../../services/metadata.js'
import { CollectionResource } from '../../types/collection.types.js'
import { JobResult } from '../../types/job.types.js'

const context = await getApiContext()
export async function processCollectionJob(job: Job<any, any, string>): Promise<
  JobResult &
    Partial<{
      collectionId: string
      signature: string
      tokenMintAddress: string
      tokenAccountAddress: string
      metadataAccountAddress: string
      masterEditionAccountAddress: string
      error: string | any
    }>
> {
  const { id, name, token, data } = job
  context.log.info(`⚙️ Executing ${name!} job | id: ${id!}`)

  let collection: CollectionResource | undefined
  try {
    collection = await processCollection(data.id)
    if (!collection) throw new Error('Collection not found or failed to set to processing')

    const resource = {
      name: collection?.collectionName ?? '',
      symbol: collection?.collectionSymbol ?? '',
      description: collection?.collectionDescription ?? '',
      image: collection?.collectionMedia ?? '',
    }
    const metadataUri = await prepareMetadata(resource)
    if (!metadataUri) throw new Error('Collection metadata resources not found')

    await updateCollection(collection._id.toString(), {
      collectionMetadataUri: metadataUri,
    })

    // Write transaction on Solana
    const { signature, tokenMintAddress, tokenAccountAddress, metadataAccountAddress, masterEditionAccountAddress } =
      await dispatch({
        name: collection.collectionName ?? '',
        symbol: collection.collectionSymbol ?? '',
        description: collection.collectionDescription ?? '',
        uri: metadataUri,
        sellerFeeBasisPoints: collection.sellerFeeBasisPoints ?? 0,
      })
    if (!signature) throw new Error('Collection transaction signature not found')

    // Update offchain records and logs
    await updateCollection(collection._id.toString(), {
      tokenMintAddress,
      tokenAccountAddress,
      metadataAccountAddress,
      masterEditionAccountAddress,
      signature,
    })
    await publishCollection(collection._id.toString())
    context.log.info(`🥳 Collection processed successfully | job id: ${id}`)
    return {
      status: 'completed',
      jobId: id ?? 'unknown',
      collectionId: collection._id.toString(),
      signature,
      tokenMintAddress,
      tokenAccountAddress,
      metadataAccountAddress,
      masterEditionAccountAddress,
    }
  } catch (error: any) {
    context.log.error('Collection job processing failed:', error)
    if (collection?._id) {
      await failCollection(collection._id.toString(), error.message || 'Unknown error while processing collection job')
    }
    return {
      status: 'failed',
      jobId: id!,
      collectionId: collection?._id?.toString(),
      error: error.message || 'Collection job failed',
    }
  }
}
