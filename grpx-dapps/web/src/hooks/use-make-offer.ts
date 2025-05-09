'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SendTransactionError,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import { BN, type Program } from '@coral-xyz/anchor'
import * as anchor from '@coral-xyz/anchor'

import { randomBytes } from 'crypto'
import { GrpxDprotocols } from '@/schemas/grpx_dprotocols'
import { useGetBalance } from '@/components/account/account-data-access'
const IDL = require('@/lib/grpx_dprotocols.json')

export function useMakeOffer() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const query = useGetBalance({ address: wallet?.publicKey || PublicKey.default })
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['make-offer'],
    mutationFn: async ({
      nftMintAddress,
      creatorAddress,
      sellingPrice,
    }: {
      nftMintAddress: string
      creatorAddress: string
      sellingPrice: number
    }) => {
      if (!wallet.publicKey || !wallet.signTransaction) throw new Error('Wallet not connected')

      if (!nftMintAddress || !PublicKey.isOnCurve(nftMintAddress)) {
        throw new Error(`Invalid NFT mint address: ${nftMintAddress}`)
      }

      // Initialize program with provider
      const programId = new PublicKey(IDL.address)
      // const program: Program<GrpxDprotocols> = new anchor.Program(IDL, { connection })

      // const provider = new anchor.AnchorProvider(connection, wallet as any, {})
      // anchor.setProvider(provider)
      // const program = new anchor.Program(IDL as anchor.Idl, provider)

      const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      anchor.setProvider(provider)
      const program = new anchor.Program(IDL, provider)

      const maker = wallet.publicKey
      const tokenMintA = new PublicKey(nftMintAddress)
      const tokenMintB = new PublicKey('So11111111111111111111111111111111111111112')

      const tokenAOfferedAmount = new BN(1)
      const tokenBWantedAmount = new BN(sellingPrice * LAMPORTS_PER_SOL)

      const id = new BN(randomBytes(8))
      const offer = PublicKey.findProgramAddressSync(
        [Buffer.from('offer'), maker.toBuffer(), id.toArrayLike(Buffer, 'le', 8)],
        programId,
      )[0]
      const vault = getAssociatedTokenAddressSync(tokenMintA, offer, true, TOKEN_PROGRAM_ID)

      const makerTokenAccountA = getAssociatedTokenAddressSync(
        new PublicKey(tokenMintA),
        new PublicKey(maker),
        false,
        TOKEN_PROGRAM_ID,
      )
      const makerTokenAccountB = getAssociatedTokenAddressSync(
        new PublicKey(tokenMintB),
        new PublicKey(maker),
        false,
        TOKEN_PROGRAM_ID,
      )
      // For completeness, even if not used in this transaction
      const taker = new PublicKey(creatorAddress)
      const takerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, taker, false, TOKEN_PROGRAM_ID)
      const takerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, taker, false, TOKEN_PROGRAM_ID)

      console.log(`Making offer with ID: ${id.toString()}`)
      console.log(`Offer PDA: ${offer.toBase58()}`)
      console.log(`Vault: ${vault.toBase58()}`)

      const accounts = {
        maker,
        taker: new PublicKey(creatorAddress),
        offer,
        vault,
        tokenMintA,
        tokenMintB,
        makerTokenAccountA,
        makerTokenAccountB,
        takerTokenAccountA,
        takerTokenAccountB,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }

      const latestBlockhash = await connection.getLatestBlockhash()
      // const ix = await program.methods
      //   .open(id, tokenAOfferedAmount, tokenBWantedAmount)
      //   .accounts(accounts)
      //   .instruction()
      // console.log('Discriminator of open:', ix.data.slice(0, 8))
      // const tx = new Transaction().add(ix)
      // console.log('Balance: ', query.data)
      // console.log('Connection: ', connection)
      // console.log(wallet)
      const tx = await program.methods
        .open(id, tokenAOfferedAmount, tokenBWantedAmount)
        .accounts(accounts)
        .transaction()
      tx.feePayer = wallet.publicKey
      tx.recentBlockhash = latestBlockhash.blockhash
      try {
        const signedTransaction = await wallet.signTransaction(tx)
        console.log('Signed transaction: ', signedTransaction)

        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: true,
          preflightCommitment: 'confirmed',
        })
        console.log('Sending raw signatures', signature)
        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

        return { offer, vault, signature }
      } catch (error) {
        // Log and re-throw the error with better details
        if (error instanceof SendTransactionError && 'logs' in error) {
          console.error('Error logs:', error.logs)
        }

        throw error
      }
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: (err) => {
      console.error(err)
    },
  })
}
