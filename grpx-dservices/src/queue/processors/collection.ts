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

type JobResult = {
  status: 'success' | 'failed'
  jobId: string
  collectionId?: string
  txSignature?: string
  destinationAddress?: string
  mintAddress?: string
  metadataAddress?: string
  masterEditionAddress?: string
  error?: string | any
}

const context = await getApiContext()
export async function processCollectionJob(job: Job<any, any, string>): Promise<JobResult> {
  const { id, name, token, data } = job
  context.log.info(`⚙️ Executing ${name!} job | id: ${id!}`)

  let collection: CollectionResource | undefined
  try {
    // Mark processing
    collection = await processCollection(data.id)
    if (!collection) throw new Error('Collection not found or failed to set to processing')

    // Process pipeline
    const resource = {
      name: collection?.collectionName ?? '',
      symbol: collection?.collectionSymbol ?? '',
      description: collection?.collectionDescription ?? '',
      image: collection?.collectionMedia ?? '',
      // animationUrl: collection?.collectionAnimationUrl ?? '',
      // externalUrl: collection?.collectionExternalUrl ?? '',
      // attributes: collection?.collectionAttributes ?? '',
    }
    const metadataUri = await prepareMetadata(resource)
    if (!metadataUri) throw new Error('Collection metadata resources not found')

    await updateCollection(collection._id.toString(), {
      collectionMetadataUri: metadataUri,
    })

    // Write transaction on Solana
    const { destinationAddress, mintAddress, metadataAddress, masterEditionAddress, txSignature } = await dispatch({
      name: collection.collectionName ?? '',
      symbol: collection.collectionSymbol ?? '',
      description: collection.collectionDescription ?? '',
      uri: metadataUri,
      sellerFeeBasisPoints: collection.sellerFeeBasisPoints ?? 0,
    })
    if (!txSignature) throw new Error('Collection transaction signature not found')

    // Update offchain records and logs
    await updateCollection(collection._id.toString(), {
      destinationAddress,
      mintAddress,
      metadataAddress,
      masterEditionAddress,
      txSignature,
    })
    await publishCollection(collection._id.toString())
    context.log.info(`🥳 Collection processed successfully | job id: ${id}`)
    return {
      status: 'success',
      jobId: id ?? 'unknown',
      collectionId: collection._id.toString(),
      txSignature,
      destinationAddress,
      mintAddress,
      metadataAddress,
      masterEditionAddress,
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
