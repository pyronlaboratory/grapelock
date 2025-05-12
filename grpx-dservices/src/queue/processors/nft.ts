import { Job } from 'bullmq'
import { getApiContext } from '../../lib/context.js'
import {
  mintNFT,
  failNFT,
  getCollectionMintAddressForNFT,
  processNFT,
  updateNFT,
  dispatch,
} from '../../services/nft.js'
import { NFTResource } from '../../types/nft.types.js'
import { prepareMetadata } from '../../services/metadata.js'

type JobResult = {
  status: 'success' | 'failed'
  jobId: string
  nftId?: string
  txSignature?: string
  destinationAddress?: string
  mintAddress?: string
  metadataAddress?: string
  masterEditionAddress?: string
  error?: string | any
}

const context = await getApiContext()

export async function processMintingJob(job: Job<any, any, string>): Promise<JobResult> {
  const { id, name, token, data } = job
  context.log.info(`⚙️ Executing ${name!} job | id: ${id!}`)

  let nft: NFTResource | undefined
  try {
    const nft = await processNFT(data.id)
    if (!nft) throw new Error('NFT not found or failed to set to processing')

    const { nftName, nftSymbol, nftDescription, nftMedia, nftExternalUrl, nftAttributes, sellerFeeBasisPoints } = nft
    const cleanedAttributes = (nftAttributes ?? []).filter(Boolean) as {
      trait_type: string
      value: string | number
    }[]
    const resource = {
      name: nftName ?? '',
      description: nftDescription ?? '',
      image: nftMedia ?? '',
      // animationUrl: nftAnimationUrl,
      externalUrl: nftExternalUrl ?? '',
      attributes: cleanedAttributes.length > 0 ? cleanedAttributes : undefined,
    }
    const metadataUri = await prepareMetadata(resource)
    if (!metadataUri) throw new Error('NFT metadata resources not found')

    await updateNFT(nft._id.toString(), {
      nftMetadataUri: metadataUri,
    })

    // Write transaction on Solana
    const collectionMint = await getCollectionMintAddressForNFT(nft._id.toString())
    const { destinationAddress, mintAddress, metadataAddress, masterEditionAddress, txSignature } = await dispatch({
      name: nftName ?? '',
      symbol: nftSymbol ?? '',
      description: nftDescription ?? '',
      uri: metadataUri ?? '',
      creatorAddress: nft.creatorAddress ?? '',
      sellerFeeBasisPoints: sellerFeeBasisPoints ?? 0,
      collectionMintAddress: collectionMint,
    })
    if (!txSignature) throw new Error('Minting transaction signature not found')

    // Update offchain records and logs
    await updateNFT(nft._id.toString(), {
      destinationAddress,
      mintAddress,
      metadataAddress,
      masterEditionAddress,
      txSignature,
    })
    await mintNFT(nft._id.toString())
    context.log.info(`NFT minted successfully | job id: ${id}`)
    return {
      status: 'success',
      jobId: id!,
      nftId: nft._id.toString(),
      txSignature,
      destinationAddress,
      mintAddress,
      metadataAddress,
      masterEditionAddress,
    }
  } catch (error: any) {
    context.log.error('Minting job processing failed:', error)
    if (nft?._id) {
      await failNFT(nft._id.toString(), error.message || 'Unknown error while processing collection job')
    }
    return {
      status: 'failed',
      jobId: id!,
      nftId: nft?._id?.toString(),
      error: error.message || 'NFT job failed',
    }
  }
}
