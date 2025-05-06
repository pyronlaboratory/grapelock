import * as fs from 'fs'
import path from 'path'

import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, Keypair, SystemProgram, Connection } from '@solana/web3.js'
import { AnchorProvider, Program, setProvider, Wallet } from '@coral-xyz/anchor'
import { GrpxDprotocols } from '../bridge/grpx_dprotocols.js'
import { getApiContext } from '../lib/context.js'

const IDL = require('../bridge/grpx_dprotocols.json')
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

const context = await getApiContext()
// Connection and wallet
const loadKeypair = (filename: string): Keypair => {
  const keypairFile = fs.readFileSync(filename, 'utf-8')
  const keypairData = JSON.parse(keypairFile)
  return Keypair.fromSecretKey(new Uint8Array(keypairData))
}
// Metadata and Master edition accounts
const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0]
}
const getMasterEdition = async (mint: PublicKey): Promise<PublicKey> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
    TOKEN_METADATA_PROGRAM_ID,
  )[0]
}

export async function dispatch({
  type,
  payload,
}: {
  type: 'create' | 'mint'
  payload: {
    name: string
    symbol: string
    description: string
    uri: string
    sellerFeeBasisPoints: number
    collectionMintKey?: string
  }
}): Promise<{
  mintAddress: string
  metadataAddress: string
  masterEditionAddress: string
  txSignature: string
}> {
  try {
    const isMintingRequest = type === 'mint'

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
    // const collectionMint = Keypair.generate()
    const collectionMint =
      isMintingRequest && payload.collectionMintKey ? new PublicKey(payload.collectionMintKey) : Keypair.generate()

    const mint = Keypair.generate()
    const mintAuthority = PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0]
    context.log.info(JSON.stringify({ mintAuthority }))

    const metadata = await getMetadata(
      isMintingRequest ? mint.publicKey : collectionMint instanceof Keypair ? collectionMint.publicKey : collectionMint,
    )
    const masterEdition = await getMasterEdition(
      isMintingRequest ? mint.publicKey : collectionMint instanceof Keypair ? collectionMint.publicKey : collectionMint,
    )
    const destination = getAssociatedTokenAddressSync(
      isMintingRequest ? mint.publicKey : collectionMint instanceof Keypair ? collectionMint.publicKey : collectionMint,
      wallet.payer.publicKey,
    )
    context.log.info(JSON.stringify({ metadata }))
    context.log.info(JSON.stringify({ masterEdition }))
    context.log.info(JSON.stringify({ destination }))

    const tx = await program.methods[type](payload)
      .accountsPartial({
        owner: context.signer.address,
        mint: isMintingRequest
          ? mint.publicKey
          : collectionMint instanceof Keypair
            ? collectionMint.publicKey
            : collectionMint,
        mintAuthority,
        metadata,
        masterEdition,
        destination,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: isMintingRequest ? ASSOCIATED_PROGRAM_ID : ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        ...(isMintingRequest && { collectionMint: new PublicKey(payload.collectionMintKey!) }),
      })
      .signers([mint, ...(isMintingRequest || !(collectionMint instanceof Keypair) ? [] : [collectionMint])])
      .rpc({
        skipPreflight: false,
        commitment: 'confirmed',
      })
    context.log.info(JSON.stringify({ tx }))
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
