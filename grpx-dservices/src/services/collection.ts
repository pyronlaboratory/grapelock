import * as fs from 'fs'
import path from 'path'

import { Types } from 'mongoose'
import { Collection } from '../models/collection.js'
import { CollectionType, CreateCollectionType } from '../types/collection.types.js'
import { getApiContext } from '../lib/context.js'

import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, Keypair, SystemProgram, Connection } from '@solana/web3.js'
import { AnchorProvider, Program, setProvider, Wallet } from '@coral-xyz/anchor'
import { GrpxDprotocols } from '../programs/types/grpx_dprotocols.js'

const context = await getApiContext()

export async function getCollection(publicKey: string) {
  return await Collection.find({ creatorAddress: publicKey }).lean()
}
export async function registerCollection(payload: CreateCollectionType): Promise<CollectionType> {
  const now = new Date()
  const collection = new Collection({
    ...payload,
    collectionMetadataUri: '',
    status: 'pending',
    mintAddress: '',
    metadataAddress: '',
    masterEditionAddress: '',
    createdAt: now,
    updatedAt: now,
  })

  try {
    await collection.validate()
    await collection.save()
    return collection.toObject()
  } catch (error) {
    context.log.error('Error saving collection:', error)
    throw new Error('Failed to register collection')
  }
}
export async function processCollection(id: string | Types.ObjectId): Promise<CollectionType | undefined> {
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
export async function updateCollection(id: string, updates: Partial<CollectionType>) {
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
export async function confirmCollection(id: string) {
  try {
    await Collection.findByIdAndUpdate(id, {
      status: 'completed',
      updatedAt: new Date(),
    })
  } catch (error: any) {
    context.log.error('Error marking collection as completed:', error)
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
// Load the local keypair for testing
const loadKeypair = (filename: string): Keypair => {
  const keypairFile = fs.readFileSync(filename, 'utf-8')
  const keypairData = JSON.parse(keypairFile)
  return Keypair.fromSecretKey(new Uint8Array(keypairData))
}

const IDL = require('../programs/idls/grpx_dprotocols.json')
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
export async function writeCollection(collection: CollectionType): Promise<{
  mintAddress: string
  metadataAddress: string
  masterEditionAddress: string
  txSignature: string
}> {
  // abstract to solana service
  try {
    // const program = new Program<GrpxDprotocols>(IDL) // FwHkEyk9nuCcsHfZLfT2oGmzg3atZqPr1k3n7TtUZK76
    let program: Program<GrpxDprotocols>
    let wallet: Wallet
    try {
      const connection = new Connection(process.env.RPC_URL!, 'confirmed')

      // const keypairData = JSON.parse(fs.readFileSync(process.env.SOLANA_SIGNER_PATH!, 'utf-8'))
      // const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData))
      // const wallet = new Wallet(keypair)

      const walletKeypair = loadKeypair(path.resolve(process.env.SOLANA_SIGNER_PATH!))
      wallet = new Wallet(walletKeypair)

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

      const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
      setProvider(provider)

      program = new Program<GrpxDprotocols>(IDL, provider)
    } catch (error) {
      context.log.error('Error setting up Solana transaction --wallet:', error)
      throw new Error('Solana transaction failed')
    }

    const mint = Keypair.generate()
    let mintAuthority = null
    let metadata = null
    let masterEdition = null
    try {
      mintAuthority = PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0]
      context.log.info(JSON.stringify(mintAuthority))
      metadata = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID,
      )[0]
      context.log.info(JSON.stringify(metadata))
      masterEdition = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )[0]
      context.log.info(JSON.stringify(masterEdition))
    } catch (error) {
      context.log.error('Error setting up Solana transaction --metadata/mintauthority:', error)
      throw new Error('Solana transaction failed')
    }

    let destination = undefined
    try {
      destination = getAssociatedTokenAddressSync(mint.publicKey, wallet.payer.publicKey)
      context.log.info(JSON.stringify(destination))
    } catch (error) {
      context.log.error('Error setting up Solana transaction --destination:', error)
    }

    const tx = await program.methods
      .createCollection({
        name: collection.collectionName,
        symbol: collection.collectionSymbol,
        description: collection.collectionSymbol,
        uri: collection.collectionMetadataUri ?? '',
        sellerFeeBasisPoints: collection.sellerFee,
        creatorShare: collection.creatorShare,
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

    return {
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
