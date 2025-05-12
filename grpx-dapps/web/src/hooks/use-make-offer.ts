'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram, Transaction } from '@solana/web3.js'

import * as anchor from '@coral-xyz/anchor'
import { randomBytes } from 'crypto'
import { GrpxDprotocols } from '@/schemas/grpx_dprotocols'
import { createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token'

const IDL = require('@/lib/grpx_dprotocols.json')
const tokenProgram = TOKEN_PROGRAM_ID

export function useMakeOffer() {
  const { connection } = useConnection()
  const client = useQueryClient()
  const wallet = useWallet()

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

      const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      anchor.setProvider(provider)
      const program = new anchor.Program<GrpxDprotocols>(IDL, provider)

      const maker = wallet.publicKey
      const taker = PublicKey.default

      const tokenMintA = new PublicKey(nftMintAddress)
      const tokenMintB = new PublicKey('So11111111111111111111111111111111111111112')

      const tokenAOfferedAmount = new anchor.BN(1)
      const tokenBWantedAmount = new anchor.BN(sellingPrice * LAMPORTS_PER_SOL)

      const makerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, maker, true, tokenProgram)
      const makerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, maker, true, tokenProgram)
      const takerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, taker, true, tokenProgram)
      const takerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, taker, true, tokenProgram)

      // console.log(`Token A Mint: ${nftMintAddress.toString()}`)
      // console.log(`Token A Account Token (maker): ${makerTokenAccountA.toString()}`)

      // const largestAccounts = await connection.getTokenLargestAccounts(tokenMintA)
      // const largest = largestAccounts.value[0]?.address
      // const accountInfo = await connection.getParsedAccountInfo(largest)

      // console.log('Current NFT holding account:', largest)
      // console.log('Parsed account info:', accountInfo.value?.data)

      const id = new anchor.BN(randomBytes(8))
      const offer = PublicKey.findProgramAddressSync(
        [Buffer.from('offer'), maker.toBuffer(), id.toArrayLike(Buffer, 'le', 8)],
        programId,
      )[0]
      const vault = getAssociatedTokenAddressSync(tokenMintA, offer, true, tokenProgram)

      // console.log(`Making offer with ID: ${id.toString()}`)
      // console.log(`Offer PDA: ${offer.toBase58()}`)
      // console.log(`Vault: ${vault.toBase58()}`)

      const accounts = {
        maker,
        taker,
        offer,
        vault,
        tokenMintA,
        tokenMintB,
        makerTokenAccountA,
        makerTokenAccountB,
        takerTokenAccountA,
        takerTokenAccountB,
        tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }

      // Build transaction instructions
      const tx = new Transaction()
      // const tokens = await connection.getParsedTokenAccountsByOwner(maker, { mint: tokenMintA })
      // console.log(tokens.value)

      // Init maker associated account
      const ataInfo = await connection.getAccountInfo(makerTokenAccountA)
      if (!ataInfo) {
        const createAtaTx = new Transaction().add(
          createAssociatedTokenAccountIdempotentInstruction(
            wallet.publicKey,
            makerTokenAccountA,
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
      console.log(ataInfo, makerTokenAccountA) // <-- doesnt get execute till signing so not valid log; how to initialise before running the main transaction

      // First verify ownership
      try {
        // Check if the NFT token account exists and you own it
        const tokenAccountInfo = await connection.getParsedTokenAccountsByOwner(maker, { mint: tokenMintA })

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

      // Main transaction instructions
      const ix = await program.methods
        .open(id, tokenAOfferedAmount, tokenBWantedAmount)
        .accounts({ ...accounts })
        .instruction()

      tx.add(ix)
      tx.feePayer = wallet.publicKey

      const latestBlockhash = await connection.getLatestBlockhash()
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
        console.log(id, offer, offer.toBase58(), vault, vault.toBase58(), signature)

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
