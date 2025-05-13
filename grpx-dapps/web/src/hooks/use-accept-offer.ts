'use client'

import { OfferResource } from '@/schemas/offer'
import { AnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as anchor from '@coral-xyz/anchor'
import { GrpxDprotocols } from '@/schemas/grpx_dprotocols'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'

/**
 * Sync the balance of a native SOL wrapped token account with its underlying SOL balance
 */
export function syncNative(programId: PublicKey, account: PublicKey) {
  const BufferLayout = require('buffer-layout') // or import as shown earlier
  const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')])
  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode({ instruction: 17 }, data)

  return new TransactionInstruction({
    keys: [{ pubkey: account, isSigner: false, isWritable: true }],
    programId,
    data,
  })
}

const IDL = require('@/idl/grpx_dprotocols.json')

// Object { id: {…}, producer: {…}, consumer: null, tokenMintA: {…}, tokenMintB: {…}, tokenAOfferedAmount: {…}, tokenBDesiredAmount: {…}, status: {…}, bump: 255 }
// use-accept-offer.ts:86:14
// {
//   "id": "9e351842cbb35482",
//   "producer": "EpmGcK3Uc73ncnnTn2a5gRnCuz1C8UsqKRdpkt4WJbRj",
//   "consumer": null,
//   "tokenMintA": "A1EvnMFmyqSwn9FPfpXqQQRpFAP56Xz647RnfGMgKioD",
//   "tokenMintB": "So11111111111111111111111111111111111111112",
//   "tokenAOfferedAmount": "01",
//   "tokenBDesiredAmount": "0bb8",
//   "status": {
//     "created": {}
//   },
//   "bump": 255
// }
// Sending raw signatures nbXhRKu3SkXK9Kbm6ywbyyGTiogn9Y9pv46nxMXU6DjpU4vzzG9dwXYQE7diJqKmr1cydghG6GiopGhsyXVRej9

// {
// 	"error": "Invalid data",
// 	"details": [
// 		{
// 			"message": "_id is _id must be a MongoDB ObjectId"
// 		},
// 		{
// 			"message": "status is Expected 'open' | 'in_progress' | 'closed' | 'completed' | 'failed', received object"
// 		}
// 	]
// }
export function useAcceptOffer() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['accept-offer'],
    mutationFn: async ({ offerObj }: { offerObj: OfferResource }) => {
      if (!wallet.publicKey || !wallet.signTransaction) throw new Error('Wallet not connected')
      const provider = new anchor.AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })
      anchor.setProvider(provider)

      const program = new anchor.Program<GrpxDprotocols>(IDL, provider)
      const tokenProgram = TOKEN_PROGRAM_ID // TOKEN_2022_PROGRAM_ID

      const offer = new PublicKey(offerObj.offer)
      const producer = new PublicKey(offerObj.producer)
      const consumer = wallet.publicKey
      const tokenMintA = new PublicKey(offerObj.tokenMintA)
      const tokenMintB = new PublicKey(offerObj.tokenMintB)
      const vaultTokenAccountA = new PublicKey(offerObj.vaultTokenAccountA)
      const vaultTokenAccountB = new PublicKey(offerObj.vaultTokenAccountB)

      const producerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, producer, true, tokenProgram)
      const producerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, producer, true, tokenProgram)
      const consumerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, consumer, true, tokenProgram)
      const consumerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, consumer, true, tokenProgram)

      // First, ensure the vault token account B is initialized
      const vaultAccountBInfo = await connection.getAccountInfo(vaultTokenAccountB)
      if (!vaultAccountBInfo) {
        const createVaultBTx = new Transaction().add(
          createAssociatedTokenAccountIdempotentInstruction(
            wallet.publicKey,
            vaultTokenAccountB,
            offer,
            tokenMintB,
            tokenProgram,
          ),
        )
        createVaultBTx.feePayer = wallet.publicKey
        const bh = await connection.getLatestBlockhash()
        createVaultBTx.recentBlockhash = bh.blockhash

        const signed = await wallet.signTransaction(createVaultBTx)
        const sig = await connection.sendRawTransaction(signed.serialize())
        await connection.confirmTransaction({ signature: sig, ...bh }, 'confirmed')
      }

      // Create the consumer token account B if it doesn't exist
      const consumerAtaInfo = await connection.getAccountInfo(consumerTokenAccountB)
      if (!consumerAtaInfo) {
        const createAtaTx = new Transaction().add(
          createAssociatedTokenAccountIdempotentInstruction(
            wallet.publicKey,
            consumerTokenAccountB,
            wallet.publicKey,
            tokenMintB,
            tokenProgram,
          ),
        )
        createAtaTx.feePayer = wallet.publicKey
        const bh = await connection.getLatestBlockhash()
        createAtaTx.recentBlockhash = bh.blockhash

        const signed = await wallet.signTransaction(createAtaTx)
        const sig = await connection.sendRawTransaction(signed.serialize())
        await connection.confirmTransaction({ signature: sig, ...bh }, 'confirmed')
      }

      // Verify that the consumer has enough SOL for the transaction
      const offerAccount = await program.account.offer.fetch(offer)
      const tokenBDesiredAmount = new anchor.BN(offerAccount.tokenBDesiredAmount).toNumber()

      // Check SOL balance and Wrapped SOL balance
      const nativeSolBalance = await connection.getBalance(wallet.publicKey)
      console.log('Required SOL:', tokenBDesiredAmount / LAMPORTS_PER_SOL)
      console.log('Current native SOL balance:', nativeSolBalance / LAMPORTS_PER_SOL)

      if (nativeSolBalance < tokenBDesiredAmount + 1000000) {
        // Extra for rent and fees
        throw new Error(
          `Insufficient SOL balance. Need ${tokenBDesiredAmount / LAMPORTS_PER_SOL} SOL to complete this transaction.`,
        )
      }

      // Check if consumer has enough Wrapped SOL; if not, fund the account
      try {
        const tokenAccounts = await connection.getTokenAccountBalance(consumerTokenAccountB)
        const wrappedSolBalance = Number(tokenAccounts.value.amount)
        console.log('Current wrapped SOL balance:', wrappedSolBalance / LAMPORTS_PER_SOL)

        if (wrappedSolBalance < tokenBDesiredAmount) {
          console.log('Funding wrapped SOL account with required amount')

          // Create a transaction to fund the wrapped SOL account
          const fundingTx = new Transaction()
          // Transfer native SOL to the token account and sync native
          fundingTx.add(
            SystemProgram.transfer({
              fromPubkey: wallet.publicKey,
              toPubkey: consumerTokenAccountB,
              lamports: tokenBDesiredAmount + 10000, // A bit extra to cover potential fees
            }),
          )
          // Add instruction to sync the wrapped SOL balance
          const syncNativeIx = syncNative(tokenProgram, consumerTokenAccountB)
          fundingTx.add(syncNativeIx)

          fundingTx.feePayer = wallet.publicKey
          const fundingBlockhash = await connection.getLatestBlockhash()
          fundingTx.recentBlockhash = fundingBlockhash.blockhash

          const signedFundingTx = await wallet.signTransaction(fundingTx)
          const fundingSignature = await connection.sendRawTransaction(signedFundingTx.serialize())
          await connection.confirmTransaction({ signature: fundingSignature, ...fundingBlockhash }, 'confirmed')
          console.log('Successfully funded wrapped SOL account:', fundingSignature)
        }
      } catch (error) {
        console.error('Error checking or funding wrapped SOL account:', error)
        // If the token account doesn't exist yet, this will fail but we can continue
        // since we've already checked the native SOL balance
      }

      // Neatly destructure
      const accounts = {
        offer,
        producer,
        consumer,
        tokenMintA,
        tokenMintB,
        vaultTokenAccountA,
        vaultTokenAccountB,
        producerTokenAccountA,
        producerTokenAccountB,
        consumerTokenAccountA,
        consumerTokenAccountB,
        tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }

      console.log('Accepting offer with accounts:', accounts)

      // Check token account balances for debugging
      try {
        const wrappedSolBalance = await connection.getTokenAccountBalance(consumerTokenAccountB)
        console.log('Final wrapped SOL balance before accept:', wrappedSolBalance.value.amount)
      } catch (err) {
        console.log('Could not check wrapped SOL balance:', err)
      }

      const tx = new Transaction()
      const ix = await program.methods
        .accept()
        .accounts({ ...accounts })
        .instruction()

      tx.add(ix)
      tx.feePayer = wallet.publicKey // should be consumer

      const latest = await connection.getLatestBlockhash()
      tx.recentBlockhash = latest.blockhash

      const signedTransaction = await wallet.signTransaction(tx)
      console.log('Signed transaction: ', signedTransaction)

      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: true,
        preflightCommitment: 'confirmed',
      })
      console.log('Sending raw signatures', signature)

      await connection.confirmTransaction({ signature, ...latest }, 'confirmed')
      const updatedOfferAccount = await program.account.offer.fetch(offer)
      console.log({ updatedOfferAccount })

      const isAccepted = Object.keys(updatedOfferAccount.status)[0] === 'accepted'
      if (!isAccepted) {
        throw new Error('Offer was not accepted successfully on-chain')
      }

      // Also return consumer details..
      return {
        txSignature: signature,
        consumer: wallet.publicKey.toBase58(),
        status: Object.keys(updatedOfferAccount.status)[0],
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
