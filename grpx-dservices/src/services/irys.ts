import { Uploader } from '@irys/upload'
import { UploadResponse } from '@irys/upload-core'
import { Solana } from '@irys/upload-solana'
import { getApiContext } from '../lib/context.js'

let irysUploaderInstance: Awaited<ReturnType<ReturnType<typeof Uploader>['withWallet']>> | null = null
const context = await getApiContext()
async function getIrysUploader() {
  if (!irysUploaderInstance) {
    irysUploaderInstance = await Uploader(Solana).withWallet(process.env.PRIVATE_KEY!)
  }
  return irysUploaderInstance
}
const uploadData = async (data: string): Promise<UploadResponse | undefined> => {
  const irysUploader = await getIrysUploader()
  try {
    const receipt = await irysUploader.upload(data)
    context.log.info(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`)
    return receipt
  } catch (error) {
    context.log.error('Error when uploading ', error)
  }
}
export { uploadData }
// TODO --
// Finish inactive functions / upload file and folder
const uploadFile = async () => {
  const irysUploader = await getIrysUploader()
  const fileToUpload = './myImage.png'
  const tags = [{ name: 'application-id', value: 'MyNFTDrop' }]
  try {
    const receipt = await irysUploader.uploadFile(fileToUpload, { tags: tags })
    console.log(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`)
  } catch (e) {
    console.log('Error when uploading ', e)
  }
}
// When uploading a folder, files can be accessed
// either directly at https://gateway.irys.xyz/:transactionId
// or https://gateway.irys.xyz/:manifestId/:fileName
const uploadFolder = async () => {
  const irysUploader = await getIrysUploader()
  const folderToUpload = './my-images/' // Path to folder
  try {
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
  try {
    const fundTx = await irysUploader.fund(irysUploader.utils.toAtomic(0.05))
    console.log(`Successfully funded ${irysUploader.utils.fromAtomic(fundTx.quantity)} ${irysUploader.token}`)
  } catch (e) {
    console.log('Error when funding ', e)
  }
}
