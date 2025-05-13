'use client'

import { AnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram, Transaction } from '@solana/web3.js'

import * as anchor from '@coral-xyz/anchor'
import { randomBytes } from 'crypto'
import { GrpxDprotocols } from '@/schemas/grpx_dprotocols'
import { createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token'

const IDL = require('@/idl/grpx_dprotocols.json')

// TODO: Clean
export function useMakeOffer() {
  const { connection } = useConnection()
  const wallet = useWallet() // should be sent earlier?

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

      const provider = new anchor.AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })
      anchor.setProvider(provider)
      const program = new anchor.Program<GrpxDprotocols>(IDL, provider)
      const tokenProgram = TOKEN_PROGRAM_ID // TOKEN_2022_PROGRAM_ID

      const producer = wallet.publicKey || creatorAddress
      const consumer = PublicKey.default

      const tokenMintA = new PublicKey(nftMintAddress)
      const tokenMintB = new PublicKey('So11111111111111111111111111111111111111112')

      const producerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, producer, true, tokenProgram)
      const producerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, producer, true, tokenProgram)
      const consumerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, consumer, true, tokenProgram)
      const consumerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, consumer, true, tokenProgram)

      // console.log(`Token A Mint: ${nftMintAddress.toString()}`)
      // console.log(`Token A Account Token (producer): ${producerTokenAccountA.toString()}`)

      // const largestAccounts = await connection.getTokenLargestAccounts(tokenMintA)
      // const largest = largestAccounts.value[0]?.address
      // const accountInfo = await connection.getParsedAccountInfo(largest)
      // console.log('Current NFT holding account:', largest)
      // console.log('Parsed account info:', accountInfo.value?.data)

      // const tokens = await connection.getParsedTokenAccountsByOwner(producer, { mint: tokenMintA })
      // console.log(tokens.value)

      const id = new anchor.BN(randomBytes(8))
      const offer = PublicKey.findProgramAddressSync(
        [Buffer.from('offer'), producer.toBuffer(), id.toArrayLike(Buffer, 'le', 8)],
        program.programId,
      )[0]
      const vaultTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, offer, true, tokenProgram)
      const vaultTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, offer, true, tokenProgram)

      // console.log(`Making offer with ID: ${id.toString()}`)
      // console.log(`Offer PDA: ${offer.toBase58()}`)
      // console.log(`Vault A: ${vaultTokenAccountA.toBase58()}`)
      // console.log(`Vault B: ${vaultTokenAccountB.toBase58()}`)

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

      // Build transaction instructions
      const tx = new Transaction()

      // Very sus!
      // Init producer associated account
      const ataInfo = await connection.getAccountInfo(producerTokenAccountA)
      if (!ataInfo) {
        const createAtaTx = new Transaction().add(
          createAssociatedTokenAccountIdempotentInstruction(
            wallet.publicKey,
            producerTokenAccountA,
            wallet.publicKey,
            tokenMintA,
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
      console.log(ataInfo, producerTokenAccountA)

      // First verify ownership 🤮
      try {
        // Check if the NFT token account exists and you own it
        const tokenAccountInfo = await connection.getParsedTokenAccountsByOwner(producer, { mint: tokenMintA })

        if (
          tokenAccountInfo.value.length === 0 ||
          Number(tokenAccountInfo.value[0].account.data.parsed.info.tokenAmount.amount) !== 1
        ) {
          throw new Error("You don't own this NFT")
        }

        // Now proceed with listing the NFT
        // ...rest of your code for listing...
      } catch (error) {
        console.error('Error:', error)
        throw new Error('Failed to list NFT: ' + error)
      }

      // Main transaction instructions 🤮
      const latestBlockhash = await connection.getLatestBlockhash()

      const ix = await program.methods
        .open(id, new anchor.BN(1), new anchor.BN(sellingPrice * LAMPORTS_PER_SOL))
        .accounts({ ...accounts })
        .instruction()

      // What happened to the transaction above?
      tx.add(ix)
      tx.feePayer = wallet.publicKey // should be producer
      tx.recentBlockhash = latestBlockhash.blockhash

      // 🤮
      try {
        const signedTransaction = await wallet.signTransaction(tx)
        console.log('Signed transaction: ', signedTransaction)

        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: true,
          preflightCommitment: 'confirmed',
        })
        console.log('Sending raw signatures', signature)

        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
        console.log(offer.toBase58(), vaultTokenAccountA.toBase58(), vaultTokenAccountB.toBase58(), signature)

        return {
          offer,
          vaultTokenAccountA: vaultTokenAccountA.toBase58(),
          vaultTokenAccountB: vaultTokenAccountB.toBase58(),
          tokenMintA: tokenMintA.toBase58(),
          tokenMintB: tokenMintB.toBase58(),
          signature,
        }
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
