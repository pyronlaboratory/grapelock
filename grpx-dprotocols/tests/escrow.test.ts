import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'

import { GrpxDprotocols } from '../target/types/grpx_dprotocols'
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import {
  MINT_SIZE,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from 'bn.js'
import { randomBytes } from 'crypto'

const IDL = require('../target/idl/grpx_dprotocols.json')

describe('grpx-dprotocols/escrow', () => {
  anchor.setProvider(anchor.AnchorProvider.env())
  const provider = anchor.getProvider()
  const connection = provider.connection
  const program = new Program<GrpxDprotocols>(IDL, provider)
  const tokenProgram = TOKEN_2022_PROGRAM_ID

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash()

    await connection.confirmTransaction({
      signature,
      ...block,
    })

    return signature
  }

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=${
        connection.rpcEndpoint.split('.')[1]
      }`,
    )

    return signature
  }

  const createSetup = () => {
    const [producer, consumer, tokenMintA, tokenMintB] = Array.from({ length: 4 }, () => Keypair.generate())

    const [producerTokenAccountA, producerTokenAccountB, consumerTokenAccountA, consumerTokenAccountB] = [
      producer,
      consumer,
    ]
      .map((a) =>
        [tokenMintA, tokenMintB].map((m) =>
          getAssociatedTokenAddressSync(m.publicKey, a.publicKey, false, tokenProgram),
        ),
      )
      .flat()

    const id = new BN(randomBytes(8))
    const offer = PublicKey.findProgramAddressSync(
      [Buffer.from('offer'), producer.publicKey.toBuffer(), id.toArrayLike(Buffer, 'le', 8)],
      program.programId,
    )[0]

    const vaultTokenAccountA = getAssociatedTokenAddressSync(tokenMintA.publicKey, offer, true, tokenProgram)
    const vaultTokenAccountB = getAssociatedTokenAddressSync(tokenMintB.publicKey, offer, true, tokenProgram)

    const accounts = {
      producer: producer.publicKey,
      consumer: consumer.publicKey,
      tokenMintA: tokenMintA.publicKey,
      tokenMintB: tokenMintB.publicKey,
      producerTokenAccountA,
      producerTokenAccountB,
      consumerTokenAccountA,
      consumerTokenAccountB,
      offer,
      vaultTokenAccountA,
      vaultTokenAccountB,
      tokenProgram,
    }

    return {
      producer,
      consumer,
      tokenMintA,
      tokenMintB,
      producerTokenAccountA,
      producerTokenAccountB,
      consumerTokenAccountA,
      consumerTokenAccountB,
      id,
      offer,
      vaultTokenAccountA,
      vaultTokenAccountB,
      accounts,
    }
  }

  describe('Confirmation Flow', () => {
    const setup = createSetup()

    it('Initialization', async () => {
      let lamports = await getMinimumBalanceForRentExemptMint(connection)
      let tx = new Transaction()

      tx.instructions = [
        ...[setup.producer, setup.consumer].map((a) =>
          SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: a.publicKey,
            lamports: 0.1 * LAMPORTS_PER_SOL,
          }),
        ),
        ...[setup.tokenMintA, setup.tokenMintB].map((m) =>
          SystemProgram.createAccount({
            fromPubkey: provider.publicKey,
            newAccountPubkey: m.publicKey,
            lamports,
            space: MINT_SIZE,
            programId: tokenProgram,
          }),
        ),
        ...[
          { mint: setup.tokenMintA.publicKey, authority: setup.producer.publicKey, ata: setup.producerTokenAccountA },
          { mint: setup.tokenMintB.publicKey, authority: setup.consumer.publicKey, ata: setup.consumerTokenAccountB },
        ].flatMap((x) => [
          createInitializeMint2Instruction(x.mint, 6, x.authority, null, tokenProgram),
          createAssociatedTokenAccountIdempotentInstruction(
            provider.publicKey,
            x.ata,
            x.authority,
            x.mint,
            tokenProgram,
          ),
          createMintToInstruction(x.mint, x.ata, x.authority, 2, undefined, tokenProgram),
        ]),
      ]

      await provider.sendAndConfirm(tx, [setup.producer, setup.consumer, setup.tokenMintA, setup.tokenMintB]).then(log)
    })

    it('CreateOffer', async () => {
      await program.methods
        .open(setup.id, new BN(1), new BN(1))
        .accounts({ ...setup.accounts })
        .signers([setup.producer])
        .rpc()
        .then(confirm)
        .then(log)
    })

    it('AcceptOffer', async () => {
      await program.methods
        .accept()
        .accounts({ ...setup.accounts })
        .signers([setup.consumer])
        .rpc()
        .then(confirm)
        .then(log)
    })

    it('ConfirmOffer', async () => {
      await program.methods
        .confirm()
        .accounts({ ...setup.accounts })
        .signers([setup.consumer])
        .rpc()
        .then(confirm)
        .then(log)
    })
  })

  describe('Refund Flow - After Opening', () => {
    const setup = createSetup()

    it('Initialization', async () => {
      let lamports = await getMinimumBalanceForRentExemptMint(connection)
      let tx = new Transaction()

      tx.instructions = [
        ...[setup.producer, setup.consumer].map((a) =>
          SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: a.publicKey,
            lamports: 0.1 * LAMPORTS_PER_SOL,
          }),
        ),
        ...[setup.tokenMintA, setup.tokenMintB].map((m) =>
          SystemProgram.createAccount({
            fromPubkey: provider.publicKey,
            newAccountPubkey: m.publicKey,
            lamports,
            space: MINT_SIZE,
            programId: tokenProgram,
          }),
        ),
        ...[
          { mint: setup.tokenMintA.publicKey, authority: setup.producer.publicKey, ata: setup.producerTokenAccountA },
          { mint: setup.tokenMintB.publicKey, authority: setup.consumer.publicKey, ata: setup.consumerTokenAccountB },
        ].flatMap((x) => [
          createInitializeMint2Instruction(x.mint, 6, x.authority, null, tokenProgram),
          createAssociatedTokenAccountIdempotentInstruction(
            provider.publicKey,
            x.ata,
            x.authority,
            x.mint,
            tokenProgram,
          ),
          createMintToInstruction(x.mint, x.ata, x.authority, 2, undefined, tokenProgram),
        ]),
      ]

      await provider.sendAndConfirm(tx, [setup.producer, setup.consumer, setup.tokenMintA, setup.tokenMintB]).then(log)
    })

    it('CreateOffer', async () => {
      await program.methods
        .open(setup.id, new BN(1), new BN(1))
        .accounts({ ...setup.accounts })
        .signers([setup.producer])
        .rpc()
        .then(confirm)
        .then(log)
    })

    it('RefundOffer: after opening', async () => {
      const refundAccounts = {
        ...setup.accounts,
        initiator: setup.producer.publicKey,
      }
      refundAccounts.vaultTokenAccountB = null
      await program.methods.refund().accounts(refundAccounts).signers([setup.producer]).rpc().then(confirm).then(log)
    })
  })

  describe('Refund Flow - After Accepting', () => {
    const setup = createSetup()

    it('Initialization', async () => {
      let lamports = await getMinimumBalanceForRentExemptMint(connection)
      let tx = new Transaction()

      tx.instructions = [
        ...[setup.producer, setup.consumer].map((a) =>
          SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: a.publicKey,
            lamports: 0.1 * LAMPORTS_PER_SOL,
          }),
        ),
        ...[setup.tokenMintA, setup.tokenMintB].map((m) =>
          SystemProgram.createAccount({
            fromPubkey: provider.publicKey,
            newAccountPubkey: m.publicKey,
            lamports,
            space: MINT_SIZE,
            programId: tokenProgram,
          }),
        ),
        ...[
          { mint: setup.tokenMintA.publicKey, authority: setup.producer.publicKey, ata: setup.producerTokenAccountA },
          { mint: setup.tokenMintB.publicKey, authority: setup.consumer.publicKey, ata: setup.consumerTokenAccountB },
        ].flatMap((x) => [
          createInitializeMint2Instruction(x.mint, 6, x.authority, null, tokenProgram),
          createAssociatedTokenAccountIdempotentInstruction(
            provider.publicKey,
            x.ata,
            x.authority,
            x.mint,
            tokenProgram,
          ),
          createMintToInstruction(x.mint, x.ata, x.authority, 2, undefined, tokenProgram),
        ]),
      ]

      await provider.sendAndConfirm(tx, [setup.producer, setup.consumer, setup.tokenMintA, setup.tokenMintB]).then(log)
    })

    it('CreateOffer', async () => {
      await program.methods
        .open(setup.id, new BN(1), new BN(1))
        .accounts({ ...setup.accounts })
        .signers([setup.producer])
        .rpc()
        .then(confirm)
        .then(log)
    })

    it('AcceptOffer', async () => {
      await program.methods
        .accept()
        .accounts({ ...setup.accounts })
        .signers([setup.consumer])
        .rpc()
        .then(confirm)
        .then(log)
    })

    it('RefundOffer: after accepting', async () => {
      const refundAccounts = {
        ...setup.accounts,
        initiator: setup.producer.publicKey,
      }
      await program.methods.refund().accounts(refundAccounts).signers([setup.producer]).rpc().then(confirm).then(log)
    })
  })

  describe('Consumer Refund Flow', () => {
    const setup = createSetup()

    it('Initialization', async () => {
      let lamports = await getMinimumBalanceForRentExemptMint(connection)
      let tx = new Transaction()

      tx.instructions = [
        ...[setup.producer, setup.consumer].map((a) =>
          SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: a.publicKey,
            lamports: 0.1 * LAMPORTS_PER_SOL,
          }),
        ),
        ...[setup.tokenMintA, setup.tokenMintB].map((m) =>
          SystemProgram.createAccount({
            fromPubkey: provider.publicKey,
            newAccountPubkey: m.publicKey,
            lamports,
            space: MINT_SIZE,
            programId: tokenProgram,
          }),
        ),
        ...[
          { mint: setup.tokenMintA.publicKey, authority: setup.producer.publicKey, ata: setup.producerTokenAccountA },
          { mint: setup.tokenMintB.publicKey, authority: setup.consumer.publicKey, ata: setup.consumerTokenAccountB },
        ].flatMap((x) => [
          createInitializeMint2Instruction(x.mint, 6, x.authority, null, tokenProgram),
          createAssociatedTokenAccountIdempotentInstruction(
            provider.publicKey,
            x.ata,
            x.authority,
            x.mint,
            tokenProgram,
          ),
          createMintToInstruction(x.mint, x.ata, x.authority, 2, undefined, tokenProgram),
        ]),
      ]

      await provider.sendAndConfirm(tx, [setup.producer, setup.consumer, setup.tokenMintA, setup.tokenMintB]).then(log)
    })

    it('CreateOffer', async () => {
      await program.methods
        .open(setup.id, new BN(1), new BN(1))
        .accounts({ ...setup.accounts })
        .signers([setup.producer])
        .rpc()
        .then(confirm)
        .then(log)
    })

    it('AcceptOffer', async () => {
      await program.methods
        .accept()
        .accounts({ ...setup.accounts })
        .signers([setup.consumer])
        .rpc()
        .then(confirm)
        .then(log)
    })

    it('RefundOffer: initiated by consumer', async () => {
      const refundAccounts = {
        ...setup.accounts,
        initiator: setup.consumer.publicKey,
      }
      await program.methods.refund().accounts(refundAccounts).signers([setup.consumer]).rpc().then(confirm).then(log)
    })
  })
})
