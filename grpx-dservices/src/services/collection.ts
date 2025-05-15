import { Types } from 'mongoose'
import { Collection } from '../models/collection.js'
import { CollectionResource, CreateCollectionResource } from '../types/collection.types.js'
import { getApiContext } from '../lib/context.js'

import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { TOKEN_METADATA_PROGRAM_ID, getMasterEdition, getMetadata } from './solana.js'
import { PublicKey, Keypair, SystemProgram, Connection } from '@solana/web3.js'
import { AnchorProvider, Program, setProvider, Wallet } from '@coral-xyz/anchor'
import { GrpxDprotocols } from '../bridge/grpx_dprotocols.js'

import { loadKeypair } from '../lib/utils.js'
import path from 'path'

const IDL = require('../bridge/grpx_dprotocols.json')
const context = await getApiContext()

export async function getCollections(publicKey: string) {
  try {
    return await Collection.find({ creatorAddress: publicKey }).sort({ createdAt: -1 }).lean()
  } catch (error) {
    console.error('Error fetching collections:', error)
    throw new Error('Failed to retrieve collections')
  }
}
export async function getCollection(id: string): Promise<CollectionResource> {
  const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null
  if (!objectId) {
    throw new Error('Invalid collection ID')
  }

  const collection = await Collection.findById(objectId).lean()
  if (!collection) {
    throw new Error('Collection not found')
  }

  return collection
}
export async function registerCollection(payload: CreateCollectionResource): Promise<CollectionResource> {
  try {
    const now = new Date()
    const collection = new Collection({
      ...payload,
      ownerAddress: payload.creatorAddress,
      collectionMetadataUri: '',
      status: 'pending',
      tokenMintAddress: '',
      tokenAccountAddress: '',
      metadataAccountAddress: '',
      masterEditionAccountAddress: '',
      signature: '',
      errorMessage: '',
      createdAt: now,
      updatedAt: now,
    })

    await collection.validate()
    await collection.save()
    return collection.toObject()
  } catch (error) {
    context.log.error('Error saving collection:', error)
    throw new Error('Failed to register collection')
  }
}
export async function processCollection(id: string | Types.ObjectId): Promise<CollectionResource | undefined> {
  const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null
  if (!objectId) throw new Error('Invalid collection ID')

  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: objectId },
      { status: 'processing', updatedAt: new Date() },
      { new: true },
    )

    if (!collection) {
      context.log.error('Collection not found or update to processing failed:', id)
    }

    return collection?.toObject()
  } catch (error: any) {
    context.log.error('Error processing collection:', error)
    throw new Error('Failed to processs collection')
  }
}
export async function updateCollection(id: string, updates: Partial<CollectionResource>) {
  try {
    await Collection.findByIdAndUpdate(id, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error updating collection:', error)
    throw new Error('Failed to update collection data')
  }
}
export async function publishCollection(id: string) {
  try {
    await Collection.findByIdAndUpdate(id, {
      status: 'published',
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error marking collection as published:', error)
    throw new Error('Failed to confirm collection')
  }
}
export async function failCollection(id: string, message: string) {
  try {
    await Collection.findByIdAndUpdate(id, {
      status: 'failed',
      errorMessage: message,
      updatedAt: new Date(),
    })
  } catch (error) {
    context.log.error('Error updating collection status to fail:', error)
    throw new Error('Failed to update collection status')
  }
}
export async function deleteCollection() {
  // change status to archived in MongoDB
}

// Write to solana block
export async function dispatch({
  name,
  symbol,
  description,
  uri,
  sellerFeeBasisPoints,
}: {
  name: string
  symbol: string
  description: string
  uri: string
  sellerFeeBasisPoints: number
}): Promise<{
  tokenMintAddress: string
  tokenAccountAddress: string
  metadataAccountAddress: string
  masterEditionAccountAddress: string
  signature: string
}> {
  try {
    const connection = new Connection(process.env.RPC_URL!, 'confirmed')

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
    context.log.info(`🥹 ${JSON.stringify({ metadata })}`)

    const masterEdition = await getMasterEdition(mint.publicKey)
    context.log.info(`🤩 ${JSON.stringify({ masterEdition })}`)

    const destination = getAssociatedTokenAddressSync(mint.publicKey, wallet.payer.publicKey)
    context.log.info(`💳 ${JSON.stringify({ destination })}`)

    const tx = await program.methods
      .create({
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
        metadata,
        masterEdition,
        destination,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([mint])
      .rpc({
        skipPreflight: false,
        commitment: 'confirmed',
      })
    context.log.info(`🔑 ${JSON.stringify({ tx })}`)
    return {
      tokenMintAddress: mint.publicKey.toBase58(),
      tokenAccountAddress: destination.toBase58(),
      metadataAccountAddress: metadata.toBase58(),
      masterEditionAccountAddress: masterEdition.toBase58(),
      signature: tx,
    }
  } catch (error: any) {
    context.log.error('Error writing to Solana:', error)
    throw new Error('Solana transaction failed')
  }
}
