import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { WebUploader } from '@irys/web-upload'
import { WebSolana } from '@irys/web-upload-solana'
import { Wallet } from '@coral-xyz/anchor'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 6, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}

type Cluster = 'mainnet-beta' | 'devnet' | 'testnet' | 'custom' | 'localnet'

export function getSolanaTxExplorerLink(txSignature: string = '', cluster: Cluster): string {
  const baseUrl = 'https://explorer.solana.com/tx/'
  const clusterParam = cluster === 'custom' ? '' : `?cluster=${cluster}`
  return `${baseUrl}${txSignature}${clusterParam}`
}

export function getRandomAvatar() {
  // You can customize the random source (this uses a free avatar API)
  const randomId = Math.floor(Math.random() * 1000)
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${randomId}`
}

export function getCollectionIdenticon(seed: string) {
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`
}

// Function to upload file to Irys and return the URI
export const uploadToIrys = async (file: File, wallet: Wallet) => {
  try {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet is not properly connected')
    }
    const irysUploader = await getIrysUploader(wallet)

    const uploadedUri = await irysUploader.uploadFile(file)
    return uploadedUri
  } catch (error) {
    console.error('Error during upload', error)
    throw new Error('Upload failed')
  }
}

// TODO: better type
export async function getIrysUploader(wallet: any) {
  // Check if wallet has publicKey before trying to upload
  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet is not connected or missing publicKey')
  }

  try {
    const irysUploader = await WebUploader(WebSolana).withProvider(wallet).withRpc('https://api.devnet.solana.com')

    return irysUploader
  } catch (error) {
    console.error('Error connecting to Irys:', error)
    throw new Error('Error connecting to Irys')
  }
}

// use moment / date-fns
export function formatDate(date: string | Date) {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
