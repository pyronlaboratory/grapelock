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

const context = await getApiContext()
export async function process(job: Job<any, any, string>) {
  const { id, name, token, data } = job
  context.log.info(`Executing ${name!} collection job | JOB_ID: ${id!} | JOB_TOKEN: ${token}`)

  let collection: CollectionType | undefined
  try {
    collection = await processCollection(data)
    if (!collection) {
      context.log.error('Collection not found or failed to set to processing', id)
      throw new Error('Collection not found or failed to set to processing')
    }

    collection = await prepareMetadata(collection)
    const solanaTx = await writeCollection(collection)

    // await updateCollection(collection._id.toString(), solanaTx)
    await confirmCollection(collection._id.toString())

    context.log.info(`Collection processed successfully | JOB_ID: ${id}`)
    return 'Collection processed successfully'
  } catch (error: any) {
    context.log.error('Job processing failed:', error)
    if (collection?._id) {
      await failCollection(collection._id.toString(), error.message || 'Unknown error while processing collection job')
    }
    throw new Error('Collection job failed')
  }
}
