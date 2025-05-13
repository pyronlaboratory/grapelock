import { NFT } from '../models/nft.js'
import {
  FullNFTResource,
  MintNFTResource,
  NFTBeaconReadingResource,
  NFTBeaconResource,
  NFTPhysicalAssetResource,
  NFTResource,
  NFTTagResource,
  nftSchema,
} from '../types/nft.types.js'
import { getApiContext } from '../lib/context.js'
import mongoose, { Types } from 'mongoose'
import { PhysicalAsset } from '../models/physical_asset.js'
import { Tag } from '../models/tags.js'
import { Beacon } from '../models/beacon.js'
import { BeaconReading } from '../models/beacon_reading.js'

import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import { TOKEN_METADATA_PROGRAM_ID, getMasterEdition, getMetadata } from './solana.js'
import { PublicKey, Keypair, SystemProgram, Connection, Transaction } from '@solana/web3.js'
import { AnchorProvider, Program, setProvider, Wallet } from '@coral-xyz/anchor'
import { GrpxDprotocols } from '../bridge/grpx_dprotocols.js'

import { loadKeypair } from '../lib/utils.js'
import path from 'path'
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token.js'

const IDL = require('../bridge/grpx_dprotocols.json')

const context = await getApiContext()

/**
 * Given an NFT ID, retrieves the associated collection mint address.
 * @param nftId - The MongoDB ObjectId of the NFT document.
 * @returns The collection's mint address as a string.
 */
export async function getCollectionMintAddressForNFT(nftId: string): Promise<string> {
  if (!mongoose.Types.ObjectId.isValid(nftId)) {
    throw new Error('Invalid NFT ID format')
  }

  const nft = await NFT.findById(nftId).populate('collectionId').exec()

  if (!nft) {
    throw new Error('NFT not found')
  }

  const collection = nft.collectionId as any

  if (!collection || !collection.mintAddress) {
    throw new Error('Associated collection or its mintAddress not found')
  }

  return collection.mintAddress
}

export async function getNFTs(collectionId: string) {
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new Error('Invalid Collection ID format')
  }

  return await NFT.find({ collectionId }).lean()
}

export async function getNFTById(nftId: string): Promise<FullNFTResource | null> {
  if (!mongoose.Types.ObjectId.isValid(nftId)) {
    throw new Error('Invalid NFT ID format')
  }

  const nft = await NFT.findById(nftId).lean()
  if (!nft) return null

  const [physicalAsset, tags, beacons] = await Promise.all([
    PhysicalAsset.findOne({ nftId: nftId }).lean() as Promise<NFTPhysicalAssetResource | null>,
    Tag.find({ productId: nftId }).lean() as Promise<NFTTagResource[]>,
    Beacon.find({ productId: nftId }).lean() as Promise<NFTBeaconResource[]>,
  ])

  const beaconsWithReadings = await Promise.all(
    (beacons || []).map(async (beacon: NFTBeaconResource) => {
      const readings = (await BeaconReading.find({
        sensorId: beacon._id,
      }).lean()) as Required<NFTBeaconReadingResource>[]
      return { ...beacon, readings }
    }),
  )

  return {
    ...nft,
    creatorAddress: nft.creatorAddress || 'anonymous',
    nftAttributes: (nft.nftAttributes || [])
      .filter((attr) => attr.trait_type && attr.value)
      .map((attr) => ({
        trait_type: attr.trait_type as string,
        value: attr.value as string,
      })),
    physicalAsset: physicalAsset || null,
    tags: tags || [],
    beacons: beaconsWithReadings || [],
  }
}

export async function registerNFT(payload: MintNFTResource): Promise<NFTResource> {
  try {
    const nft = await NFT.create({
      ...payload,
      // collectionId: new mongoose.Types.ObjectId(payload.collectionId),
      // creatorAddress: payload.creatorAddress,
      status: 'pending',
      mintAddress: null,
      destinationAddress: null,
      metadataAddress: null,
      masterEditionAddress: null,
      txSignature: null,
      errorMessage: null,
    })
    const nftObject = nft.toObject()
    const parsedNFT = nftSchema.parse(nftObject)
    return parsedNFT
  } catch (error) {
    context.log.error('Error saving nft mint data:', error)
    throw new Error('Failed to mint nft')
  }
}

export async function processNFT(id: string): Promise<NFTResource | undefined> {
  const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null
  if (!objectId) throw new Error('Invalid nft ID')

  try {
    const nft = await NFT.findOneAndUpdate(
      { _id: objectId },
      { status: 'processing', updatedAt: new Date() },
      { new: true },
    )

    if (!nft) {
      context.log.error('NFT not found or update to processing failed:', id)
    }

    return nft?.toObject() as NFTResource
  } catch (error: any) {
    context.log.error('Error processing nft:', error)
    throw new Error('Failed to processs nft')
  }
}

export async function updateNFT(id: string, updates: Partial<NFTResource>) {
  try {
    console.log(updates)
    await NFT.findByIdAndUpdate(id, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error updating nft:', error)
    throw new Error('Failed to update nft data')
  }
}

export async function mintNFT(id: string) {
  try {
    await NFT.findByIdAndUpdate(id, {
      status: 'minted',
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error marking nft as minted:', error)
    throw new Error('Failed to confirm nft minting')
  }
}

export async function failNFT(id: string, message: string) {
  try {
    await NFT.findByIdAndUpdate(id, {
      status: 'failed',
      errorMessage: message,
      updatedAt: new Date(),
    })
  } catch (error) {
    context.log.error('Error updating minting status to fail:', error)
    throw new Error('Failed to update minting status')
  }
}

// Write to solana block
export async function dispatch({
  name,
  symbol,
  description,
  uri,
  creatorAddress,
  sellerFeeBasisPoints,
  collectionMintAddress,
}: {
  name: string
  symbol: string
  description: string
  uri: string
  creatorAddress: string
  sellerFeeBasisPoints: number
  collectionMintAddress: string
}): Promise<{
  destinationAddress: string
  mintAddress: string
  metadataAddress: string
  masterEditionAddress: string
  txSignature: string
}> {
  try {
    const connection = new Connection(process.env.RPC_URL ?? 'https://api.devnet.solana.com', 'confirmed')

    const walletKeypair = loadKeypair(path.resolve(process.env.SOLANA_SIGNER_PATH!))
    const wallet: Wallet = new Wallet(walletKeypair)

    // Request airdrop if balance is low or account has no transaction history
    const balance = await connection.getBalance(wallet.publicKey)
    const transactionHistory = await connection.getSignaturesForAddress(wallet.publicKey)

    if (balance < 1_000_000 || transactionHistory.length === 0) {
      context.log.info(`Requesting airdrop for ${wallet.publicKey.toBase58()}`)
      try {
        const airdropSig = await connection.requestAirdrop(wallet.publicKey, 1_000_000_000) // 1 SOL
        await connection.confirmTransaction(airdropSig, 'confirmed')
        context.log.info(`Airdrop successful: ${airdropSig}`)
      } catch (airdropErr) {
        context.log.error('Airdrop failed or not supported on current network:', airdropErr)
      }
    }

    // Provider and program
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
    setProvider(provider)

    const program: Program<GrpxDprotocols> = new Program<GrpxDprotocols>(IDL, provider)

    // Minting keys and authority
    const mint = Keypair.generate()
    const mintAuthority = PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0]

    const metadata = await getMetadata(mint.publicKey)
    context.log.info(JSON.stringify({ metadata }))

    const masterEdition = await getMasterEdition(mint.publicKey)
    context.log.info(JSON.stringify({ masterEdition }))

    const destination = getAssociatedTokenAddressSync(mint.publicKey, wallet.payer.publicKey)
    context.log.info(JSON.stringify({ destination }))

    const tx = await program.methods
      .mint({
        name,
        symbol,
        description,
        uri,
        sellerFeeBasisPoints,
      })
      .accountsPartial({
        owner: context.signer.address,
        mint: mint.publicKey,
        mintAuthority,
        collectionMint: collectionMintAddress,
        metadata,
        masterEdition,
        destination,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([mint])
      .rpc({
        skipPreflight: false,
        commitment: 'confirmed',
      })
    context.log.info(JSON.stringify({ tx }))

    const recipientPublicKey = new PublicKey(creatorAddress)
    const recipientAta = await getAssociatedTokenAddress(mint.publicKey, recipientPublicKey)

    const recipientAccountInfo = await connection.getAccountInfo(recipientAta)
    const ataInstructions = !recipientAccountInfo
      ? [createAssociatedTokenAccountInstruction(wallet.publicKey, recipientAta, recipientPublicKey, mint.publicKey)]
      : []

    const transferInstruction = createTransferInstruction(destination, recipientAta, wallet.publicKey, 1)

    // Send the transaction
    const transferTx = new Transaction().add(...ataInstructions, transferInstruction)
    const txSig = await provider.sendAndConfirm(transferTx, [])
    context.log.info(`NFT transferred to ${recipientPublicKey.toBase58()}: ${txSig}`)

    return {
      destinationAddress: destination.toBase58(),
      mintAddress: mint.publicKey.toBase58(),
      metadataAddress: metadata.toBase58(),
      masterEditionAddress: masterEdition.toBase58(),
      txSignature: tx,
    }
  } catch (error: any) {
    context.log.error('Error writing to Solana:', error)
    throw new Error('Solana transaction failed')
  }
}
