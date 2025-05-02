import { Job } from 'bullmq'
import { getApiContext } from '../../lib/context.js'
import {
  confirmCollection,
  failCollection,
  processCollection,
  updateCollection,
  writeCollection,
} from '../../services/collection.js'
import { prepareMetadata } from '../../services/metadata.js'
import { CollectionType } from '../../types/collection.types.js'

type JobResult = {
  status: 'success' | 'failed'
  jobId: string
  collectionId?: string
  txSignature?: string
  mintAddress?: string
  metadataAddress?: string
  masterEditionAddress?: string
  error?: string | any
}

const context = await getApiContext()
export async function process(job: Job<any, any, string>): Promise<JobResult> {
  const { id, name, token, data } = job
  context.log.info(`⚙️ Executing ${name!} job | id: ${id!}`)

  let collection: CollectionType | undefined
  try {
    // Mark processing
    collection = await processCollection(data.id)
    if (!collection) throw new Error('Collection not found or failed to set to processing')

    // Process pipeline
    collection = await prepareMetadata(collection)
    if (!collection.collectionMetadataUri) throw new Error('Collection metadata resources not found')

    // Write transaction on Solana
    const { mintAddress, metadataAddress, masterEditionAddress, txSignature } = await writeCollection(collection)

    // Update offchain records and logs
    await updateCollection(collection._id.toString(), {
      mintAddress,
      metadataAddress,
      masterEditionAddress,
      txSignature,
    })
    await confirmCollection(collection._id.toString())
    context.log.info(`Collection processed successfully | job id: ${id}`)
    return {
      status: 'success',
      jobId: id!,
      collectionId: collection._id.toString(),
      txSignature,
      mintAddress,
      metadataAddress,
      masterEditionAddress,
    }
  } catch (error: any) {
    context.log.error('Job processing failed:', error)
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
