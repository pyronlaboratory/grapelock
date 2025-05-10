// import 'dotenv/config'
// import fs from 'fs'
// import path from 'path'
// import { randomBytes } from 'node:crypto'
// import { describe, it, before } from 'node:test'
// import * as anchor from '@coral-xyz/anchor'
// import { Program } from '@coral-xyz/anchor'
// import {
//   MINT_SIZE,
//   TOKEN_2022_PROGRAM_ID,
//   type TOKEN_PROGRAM_ID,
//   createAssociatedTokenAccountIdempotentInstruction,
//   createInitializeMint2Instruction,
//   createMintToInstruction,
//   getAssociatedTokenAddressSync,
//   getMinimumBalanceForRentExemptMint,
//   getAccount,
// } from '@solana/spl-token'
// import {
//   Connection,
//   Keypair,
//   LAMPORTS_PER_SOL,
//   PublicKey,
//   SystemProgram,
//   Transaction,
//   type TransactionInstruction,
// } from '@solana/web3.js'
// import { BankrunProvider } from 'anchor-bankrun'
// import { assert } from 'chai'
// import { startAnchor } from 'anchor-bankrun'
// import type { GrpxDprotocols } from '../target/types/grpx_dprotocols'

// import { confirmTransaction, makeKeypairs } from '@solana-developers/helpers'
// import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'

// const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID = TOKEN_2022_PROGRAM_ID
// const IDL = require('../target/idl/grpx_dprotocols.json')
// const PROGRAM_ID = new PublicKey(IDL.address)

// const getRandomBigNumber = (size = 8) => {
//   return new anchor.BN(randomBytes(size))
// }

// // Load the local keypair for testing
// const loadKeypair = (filename: string): Keypair => {
//   const keypairFile = fs.readFileSync(filename, 'utf-8')
//   const keypairData = JSON.parse(keypairFile)
//   return Keypair.fromSecretKey(new Uint8Array(keypairData))
// }

// describe('grpx-dprotocols/escrow', () => {
//   let connection: Connection
//   let provider: BankrunProvider | anchor.AnchorProvider
//   let wallet: NodeWallet | anchor.Wallet
//   let program: Program<GrpxDprotocols>

//   const accounts: Record<string, PublicKey> = {
//     tokenProgram: TOKEN_PROGRAM,
//   }

//   const [alice, bob, tokenMintA, tokenMintB] = makeKeypairs(4)

//   before(async () => {
//     const CLUSTER = process.env.CLUSTER
//     if (CLUSTER === 'local') {
//       const context = await startAnchor('', [{ name: 'grpx_dprotocols', programId: PROGRAM_ID }], [])
//       provider = new BankrunProvider(context)
//       wallet = provider.wallet as NodeWallet
//       program = new anchor.Program<GrpxDprotocols>(IDL, provider)
//     } else {
//       connection = new Connection(process.env.RPC_URL || 'https://api.devnet.solana.com', 'confirmed')
//       const walletKeypair = loadKeypair(path.resolve(process.env.HOME || '', '.config/solana/id.json'))
//       wallet = new anchor.Wallet(walletKeypair)
//       provider = new anchor.AnchorProvider(connection, wallet, {
//         commitment: 'confirmed',
//       })
//       anchor.setProvider(provider)
//       program = new Program<GrpxDprotocols>(IDL, provider)
//     }

//     const [aliceTokenAccountA, aliceTokenAccountB, bobTokenAccountA, bobTokenAccountB] = [alice, bob].flatMap(
//       (keypair) =>
//         [tokenMintA, tokenMintB].map((mint) =>
//           getAssociatedTokenAddressSync(mint.publicKey, keypair.publicKey, false, TOKEN_PROGRAM),
//         ),
//     )

//     // Airdrops to users, and creates two tokens mints 'A' and 'B'"
//     const minimumLamports = await getMinimumBalanceForRentExemptMint(connection)
//     console.log(minimumLamports)
//     console.log(wallet.publicKey)
//     const balance = await connection?.getBalance(wallet.publicKey)
//     console.log('Wallet Balance: ', balance / LAMPORTS_PER_SOL, 'SOL')

//     if (balance < minimumLamports && CLUSTER !== 'local') {
//       console.log('Low balance, requesting airdrop...')
//       const [latestBlockhash, airdropSig] = await Promise.all([
//         connection.getLatestBlockhash(),
//         connection.requestAirdrop(wallet.publicKey, minimumLamports),
//       ])
//       await connection.confirmTransaction({ signature: airdropSig, ...latestBlockhash }, 'confirmed')

//       console.log('Airdrop completed.')
//     }
//     const sendSolInstructions: Array<TransactionInstruction> = [alice, bob].map((account) =>
//       SystemProgram.transfer({
//         fromPubkey: provider.publicKey,
//         toPubkey: account.publicKey,
//         lamports: 0.5 * LAMPORTS_PER_SOL,
//       }),
//     )
//     const createMintInstructions: Array<TransactionInstruction> = [tokenMintA, tokenMintB].map((mint) =>
//       SystemProgram.createAccount({
//         fromPubkey: provider.publicKey,
//         newAccountPubkey: mint.publicKey,
//         lamports: minimumLamports,
//         space: MINT_SIZE,
//         programId: TOKEN_PROGRAM,
//       }),
//     )

//     // Make tokenA and tokenB mints, mint tokens and create ATAs
//     const mintTokensInstructions: Array<TransactionInstruction> = [
//       {
//         mint: tokenMintA.publicKey,
//         authority: alice.publicKey,
//         ata: aliceTokenAccountA,
//       },
//       {
//         mint: tokenMintB.publicKey,
//         authority: bob.publicKey,
//         ata: bobTokenAccountB,
//       },
//     ].flatMap((mintDetails) => [
//       createInitializeMint2Instruction(mintDetails.mint, 6, mintDetails.authority, null, TOKEN_PROGRAM),
//       createAssociatedTokenAccountIdempotentInstruction(
//         provider.publicKey,
//         mintDetails.ata,
//         mintDetails.authority,
//         mintDetails.mint,
//         TOKEN_PROGRAM,
//       ),
//       createMintToInstruction(mintDetails.mint, mintDetails.ata, mintDetails.authority, 100, [], TOKEN_PROGRAM),
//     ])

//     console.log('Creating mints and associated token accounts...')
//     for (const [label, pubkey] of Object.entries({
//       alice: alice.publicKey.toBase58(),
//       bob: bob.publicKey.toBase58(),
//       tokenMintA: tokenMintA.publicKey.toBase58(),
//       tokenMintB: tokenMintB.publicKey.toBase58(),
//       aliceTokenAccountA: aliceTokenAccountA.toBase58(),
//       aliceTokenAccountB: aliceTokenAccountB.toBase58(),
//       bobTokenAccountA: bobTokenAccountA.toBase58(),
//       bobTokenAccountB: bobTokenAccountB.toBase58(),
//     })) {
//       console.log(`${label}: ${pubkey}`)
//     }

//     // Add all these instructions to our transaction
//     const tx = new Transaction()
//     tx.instructions = [...sendSolInstructions, ...createMintInstructions, ...mintTokensInstructions]

//     console.log('Sending setup transaction...')
//     const signature = await provider.sendAndConfirm(tx, [tokenMintA, tokenMintB, alice, bob])
//     console.log(`Setup transaction confirmed: ${signature}`)

//     // Save the accounts for later use
//     accounts.maker = alice.publicKey
//     accounts.taker = bob.publicKey
//     accounts.tokenMintA = tokenMintA.publicKey
//     accounts.makerTokenAccountA = aliceTokenAccountA
//     accounts.takerTokenAccountA = bobTokenAccountA
//     accounts.tokenMintB = tokenMintB.publicKey
//     accounts.makerTokenAccountB = aliceTokenAccountB
//     accounts.takerTokenAccountB = bobTokenAccountB
//   })

//   const tokenAOfferedAmount = new anchor.BN(1)
//   const tokenBDesiredAmount = new anchor.BN(1)

//   // We'll call this function from multiple tests, so let's seperate it out
//   const make = async () => {
//     // Pick a random ID for the offer we'll make
//     const offerId = getRandomBigNumber()

//     // Then determine the account addresses we'll use for the offer and the vault
//     const offer = PublicKey.findProgramAddressSync(
//       [Buffer.from('offer'), accounts.maker.toBuffer(), offerId.toArrayLike(Buffer, 'le', 8)],
//       program.programId,
//     )[0]

//     const vault = getAssociatedTokenAddressSync(accounts.tokenMintA, offer, true, TOKEN_PROGRAM)

//     accounts.offer = offer
//     accounts.vault = vault
//     console.log('Creating offer...')
//     console.log(`Offer ID: ${offerId.toString()}`)
//     console.log(`Offer PDA: ${offer.toBase58()}`)
//     console.log(`Vault ATA: ${vault.toBase58()}`)

//     const tx = await program.methods
//       .open(offerId, tokenAOfferedAmount, tokenBDesiredAmount)
//       .accounts(accounts)
//       .signers([alice])
//       .rpc()

//     await confirmTransaction(connection, tx)

//     // Deprecated
//     // await confirmTransaction(connection, tx)

//     // const latestBlockhash = await connection.getLatestBlockhash()
//     // Check our vault contains the tokens offered
//     // const vaultBalanceResponse = await provider.connection.getTokenAccountBalance(vault)
//     // const vaultBalance = new BN(vaultBalanceResponse.value.amount)

//     // const tx = new Transaction()
//     // tx.instructions = [openEscrowInstruction]
//     // await provider.sendAndConfirm(tx, [alice])

//     const vaultAccount = await getAccount(connection, vault, undefined, TOKEN_PROGRAM)
//     const vaultBalance = new anchor.BN(vaultAccount.amount.toString())
//     console.log(`Vault token balance: ${vaultBalance.toString()}`)
//     console.log(`Vault token owner: ${vaultAccount.owner.toBase58()}`)
//     assert(vaultBalance.eq(tokenAOfferedAmount))
//     assert(vaultAccount.owner.equals(accounts.offer))

//     // Check our Offer account contains the correct data
//     const offerAccount = await program.account.offer.fetch(offer)
//     assert(offerAccount.maker.equals(alice.publicKey))
//     assert(offerAccount.tokenMintA.equals(accounts.tokenMintA))
//     assert(offerAccount.tokenMintB.equals(accounts.tokenMintB))
//     assert(offerAccount.tokenBDesiredAmount.eq(tokenBDesiredAmount))
//     assert.ok('created' in offerAccount.status)
//     console.log('Fetched offer account data:')
//     console.log(`  Maker: ${offerAccount.maker.toBase58()}`)
//     console.log(`  TokenMintA: ${offerAccount.tokenMintA.toBase58()}`)
//     console.log(`  TokenMintB: ${offerAccount.tokenMintB.toBase58()}`)
//     console.log(`  Wanted Amount: ${offerAccount.tokenBDesiredAmount.toString()}`)
//   }

//   it('Puts the tokens Alice offers into the vault when Alice makes an offer', async () => {
//     await make()
//   })

//   // We'll call this function from multiple tests, so let's seperate it out
//   // const take = async () => {
//   //   const transactionSignature = await program.methods
//   //     .accept()
//   //     .accounts({ ...accounts })
//   //     .signers([bob])
//   //     .rpc()

//   //   await confirmTransaction(connection, transactionSignature)

//   //   // Check the offered tokens are now in Bob's account
//   //   // (note: there is no before balance as Bob didn't have any offered tokens before the transaction)
//   //   const bobTokenAccountBalanceAfterResponse = await connection.getTokenAccountBalance(accounts.takerTokenAccountA)
//   //   const bobTokenAccountBalanceAfter = new anchor.BN(bobTokenAccountBalanceAfterResponse.value.amount)
//   //   assert(bobTokenAccountBalanceAfter.eq(tokenAOfferedAmount))

//   //   // Check the wanted tokens are now in Alice's account
//   //   // (note: there is no before balance as Alice didn't have any wanted tokens before the transaction)
//   //   const aliceTokenAccountBalanceAfterResponse = await connection.getTokenAccountBalance(accounts.makerTokenAccountB)
//   //   const aliceTokenAccountBalanceAfter = new anchor.BN(aliceTokenAccountBalanceAfterResponse.value.amount)
//   //   assert(aliceTokenAccountBalanceAfter.eq(tokenBDesiredAmount))
//   // }

//   // it("Puts the tokens from the vault into Bob's account, and gives Alice Bob's tokens, when Bob takes an offer", async () => {
//   //   await take()
//   // })
// })
