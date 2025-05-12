import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
} from '@solana/spl-token'
import BN from 'bn.js'
import { getApiContext } from '../lib/context.js'
import { OfferResource } from '../types/offer.types.js'
import bs58 from 'bs58' // You'll need to install this: npm install bs58

const context = await getApiContext()

// Load program ID and other constants from environment variables
const PROGRAM_ID = new PublicKey(process.env.ESCROW_PROGRAM_ID || '')
const NETWORK_URL = process.env.SOLANA_NETWORK_URL || 'https://api.devnet.solana.com'

import fs from 'fs'

// Load secret key from a JSON file (a Uint8Array exported from Solana CLI)
const keypairPath = process.env.AUTHORITY_PRIVATE_KEY || ''
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf8')))
const authorityKeypair = Keypair.fromSecretKey(secretKey)

export class SolanaService {
  private connection: Connection

  constructor() {
    this.connection = new Connection(NETWORK_URL, 'confirmed')
  }

  /**
   * Creates an escrow offer for an NFT on Solana
   *
   * @param offer - The offer resource containing NFT details
   * @returns Transaction signature
   */
  async createEscrowOffer(offer: OfferResource): Promise<{ txSignature: string; vaultAddress: string }> {
    try {
      context.log.info(`Creating escrow offer for NFT ${offer.nftMintAddress}`)

      // Convert MongoDB ObjectId to a buffer we can use for seed generation
      const offerId = new BN(offer._id.toString().substring(0, 16), 16)

      // Get the maker's public key (the seller)
      const maker = new PublicKey(offer.producerPublicKey || authorityKeypair.publicKey.toString())

      // Get the NFT mint address
      const nftMint = new PublicKey(offer.nftMintAddress)

      // SOL is the token they want in return (system native token)
      const solMint = new PublicKey('So11111111111111111111111111111111111111112')

      // Find the PDA for the offer account
      const [offerPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('offer'), maker.toBuffer(), offerId.toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID,
      )

      // Calculate the vault address (ATA for the offer PDA)
      const vaultAddress = getAssociatedTokenAddressSync(nftMint, offerPDA, true, TOKEN_PROGRAM_ID)

      // Get the seller's token account for the NFT
      const makerNftAccount = getAssociatedTokenAddressSync(nftMint, maker, false, TOKEN_PROGRAM_ID)

      // Convert selling price to lamports (SOL's smallest unit)
      const sellingPriceInLamports = new BN(offer.sellingPrice * 1_000_000_000) // Convert SOL to lamports

      // Create a new transaction
      const transaction = new Transaction()

      // Add instruction to create the offer account
      transaction.add(
        await this.createOpenEscrowInstruction(
          maker,
          nftMint,
          solMint,
          makerNftAccount,
          offerPDA,
          vaultAddress,
          offerId,
          sellingPriceInLamports,
        ),
      )

      // Sign and send the transaction
      // Note: In production, you should have the seller sign this transaction
      // For this example, we're using the authority key for simplicity
      const txSignature = await this.connection.sendTransaction(transaction, [authorityKeypair])

      context.log.info(`Escrow offer created with signature: ${txSignature}`)

      // Wait for confirmation
      await this.connection.confirmTransaction(txSignature, 'confirmed')

      return {
        txSignature,
        vaultAddress: vaultAddress.toString(),
      }
    } catch (error: any) {
      context.log.error('Error creating escrow offer:', error)
      throw new Error(`Failed to create escrow offer: ${error.message}`)
    }
  }

  /**
   * Creates the instruction for opening an escrow contract
   */
  private async createOpenEscrowInstruction(
    maker: PublicKey,
    tokenMintA: PublicKey, // NFT mint
    tokenMintB: PublicKey, // SOL mint
    makerTokenAccountA: PublicKey, // Seller's NFT account
    offerAccount: PublicKey, // PDA for offer
    vaultAccount: PublicKey, // Vault to hold NFT
    offerId: BN,
    tokenBWantedAmount: BN, // Amount of SOL wanted
  ) {
    // Import your program's IDL
    // This would normally be done via anchor, but for simplicity:
    const instruction = {
      programId: PROGRAM_ID,
      keys: [
        { pubkey: maker, isSigner: true, isWritable: true },
        { pubkey: tokenMintA, isSigner: false, isWritable: false },
        { pubkey: tokenMintB, isSigner: false, isWritable: false },
        { pubkey: makerTokenAccountA, isSigner: false, isWritable: true },
        { pubkey: offerAccount, isSigner: false, isWritable: true },
        { pubkey: vaultAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        Buffer.from([0]), // Instruction index for 'open'
        offerId.toArrayLike(Buffer, 'le', 8),
        new BN(1).toArrayLike(Buffer, 'le', 8), // Token A amount (1 for NFT)
        tokenBWantedAmount.toArrayLike(Buffer, 'le', 8),
      ]),
    }

    return instruction
  }
}

// Create singleton instance
export const solanaService = new SolanaService()
