import path from 'path'
import * as fs from 'fs'

import { Readable } from 'stream'
import { Uploader } from '@irys/upload'
import { UploadResponse } from '@irys/upload-core'
import { Solana } from '@irys/upload-solana'
import { TokenMetadata } from './metadata.js'
import { getApiContext } from '../lib/context.js'

const context = await getApiContext()
let irysUploaderInstance: Awaited<ReturnType<ReturnType<typeof Uploader>['withWallet']>> | null = null
async function getIrysUploader() {
  if (!irysUploaderInstance) {
    try {
      const privateKey = JSON.parse(fs.readFileSync(path.resolve(process.env.SOLANA_SIGNER_PATH!), 'utf-8'))
      irysUploaderInstance = await Uploader(Solana).withWallet(privateKey)
    } catch (error) {
      context.log.error('Error while creating uploader', error)
    }
  }
  return irysUploaderInstance
}
const uploadData = async (data: string | Buffer | Readable): Promise<UploadResponse | undefined> => {
  const irysUploader = await getIrysUploader()
  if (!irysUploader) return
  try {
    const receipt = await irysUploader.upload(data)
    context.log.info(`💾 Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`)
    return receipt
  } catch (error) {
    context.log.error('Error when uploading ', error)
  }
}
const uploadFile = async (data: TokenMetadata | Object): Promise<UploadResponse | undefined> => {
  const irysUploader = await getIrysUploader()
  if (!irysUploader) return
  try {
    const file = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const path = URL.createObjectURL(file)
    const tags = [{ name: 'application-id', value: 'GrpxMetadata' }]
    const receipt = await irysUploader.uploadFile(path, { tags })
    context.log.info(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`)
    return receipt
  } catch (error) {
    context.log.error('Error when uploading ', error)
  }
}
export { uploadData, uploadFile }

// When uploading a folder, files can be accessed
// either directly at https://gateway.irys.xyz/:transactionId
// or https://gateway.irys.xyz/:manifestId/:fileName
const uploadFolder = async () => {
  const irysUploader = await getIrysUploader()
  if (!irysUploader) return
  try {
    const folderToUpload = './my-images/' // Path to folder
    const receipt = await irysUploader.uploadFolder('./' + folderToUpload, {
      indexFile: '', // Optional index file (file the user will load when accessing the manifest)
      batchSize: 50, // Number of items to upload at once
      keepDeleted: false, // whether to keep now deleted items from previous uploads
    }) // Returns the manifest ID

    console.log(`Files uploaded. Manifest ID ${receipt?.id}`)
  } catch (e) {
    console.log('Error when uploading ', e)
  }
}
const fundAccount = async () => {
  const irysUploader = await getIrysUploader()
  if (!irysUploader) return
  try {
    const fundTx = await irysUploader.fund(irysUploader.utils.toAtomic(0.05))
    console.log(`Successfully funded ${irysUploader.utils.fromAtomic(fundTx.quantity)} ${irysUploader.token}`)
  } catch (e) {
    console.log('Error when funding ', e)
  }
}
