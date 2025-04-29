import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { WebUploader } from '@irys/web-upload'
import { WebSolana } from '@irys/web-upload-solana'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}

export function getRandomAvatar() {
  // You can customize the random source (this uses a free avatar API)
  const randomId = Math.floor(Math.random() * 1000)
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${randomId}`
}

// Function to upload file to Irys and return the URI
export const uploadToIrys = async (file: File, wallet: any) => {
  console.log('Uploading with wallet', wallet)
  try {
    const irysUploader = await getIrysUploader(wallet)
    const uploadedUri = await irysUploader.uploadFile(file)
    return uploadedUri
  } catch (error) {
    console.error('Error during upload', error)
    throw new Error('Upload failed')
  }
}

export async function getIrysUploader(wallet: any) {
  // Check if wallet has publicKey before trying to upload
  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet is not connected or missing publicKey')
  }

  try {
    const irysUploader = await WebUploader(WebSolana).withProvider(wallet)
    return irysUploader
  } catch (error) {
    console.error('Error connecting to Irys:', error)
    throw new Error('Error connecting to Irys')
  }
}
