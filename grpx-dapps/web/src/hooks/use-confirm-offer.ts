'use client'

import api, { ApiResponse } from '@/lib/api'
import { OfferResource } from '@/schemas/offer'
import { OrderResource } from '@/schemas/order'
import { useConnection, useWallet, AnchorWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as anchor from '@coral-xyz/anchor'
import { GrpxDprotocols } from '@/schemas/grpx_dprotocols'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'

const IDL = require('@/idl/grpx_dprotocols.json')

export function useConfirmOffer() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['confirm-offer'],
    mutationFn: async ({ orderObj }: { orderObj: OrderResource }) => {
      console.log({ orderObj })
      const offerAccounts = await api<ApiResponse<{ data: OfferResource }>>(`offers/${orderObj.offerId}`)
      console.log(offerAccounts.data.data)

      console.log(offerAccounts.data.data.consumer)
      if (!offerAccounts || !offerAccounts.data.data.consumer) throw new Error('Accounts are missing!')
      if (!wallet.publicKey || !wallet.signTransaction) throw new Error('Wallet not connected')

      const provider = new anchor.AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })
      anchor.setProvider(provider)

      const program = new anchor.Program<GrpxDprotocols>(IDL, provider)
      const tokenProgram = TOKEN_PROGRAM_ID

      const offer = new PublicKey(offerAccounts.data.data.offer)
      const producer = new PublicKey(offerAccounts.data.data.producer)
      const consumer = new PublicKey(offerAccounts.data.data.consumer)
      const tokenMintA = new PublicKey(offerAccounts.data.data.tokenMintA)
      const tokenMintB = new PublicKey(offerAccounts.data.data.tokenMintB)
      const vaultTokenAccountA = new PublicKey(offerAccounts.data.data.vaultTokenAccountA)
      const vaultTokenAccountB = new PublicKey(offerAccounts.data.data.vaultTokenAccountB)

      const producerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, producer, true, tokenProgram)
      const producerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, producer, true, tokenProgram)
      const consumerTokenAccountA = getAssociatedTokenAddressSync(tokenMintA, consumer, true, tokenProgram)
      const consumerTokenAccountB = getAssociatedTokenAddressSync(tokenMintB, consumer, true, tokenProgram)

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
      console.log('Confirming offer with accounts:', accounts)

      const tx = new Transaction()
      const ix = await program.methods
        .confirm()
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

      // Not available anymore, closed account.. check some other way..
      // const updatedOfferAccount = await program.account.offer.fetch(offer)
      // console.log({ updatedOfferAccount })

      // const isCompleted = Object.keys(updatedOfferAccount.status)[0] === 'completed'
      // if (!isCompleted) throw new Error('Offer was not confirmed successfully on-chain')

      return {
        txSignature: signature,
        status: 'completed',
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
