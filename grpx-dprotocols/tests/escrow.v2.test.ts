// import * as anchor from '@coral-xyz/anchor'
// import { Program } from '@coral-xyz/anchor'

// import { GrpxDprotocols } from '../target/types/grpx_dprotocols'
// import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
// import {
//   MINT_SIZE,
//   createAssociatedTokenAccountIdempotentInstruction,
//   createInitializeMint2Instruction,
//   createMintToInstruction,
//   getMinimumBalanceForRentExemptMint,
//   getAssociatedTokenAddressSync,
//   TOKEN_2022_PROGRAM_ID,
// } from '@solana/spl-token'
// import { BN } from 'bn.js'
// import { randomBytes } from 'crypto'
// const IDL = require('../target/idl/grpx_dprotocols.json')
// describe('grpx-dprotocols/escrow', () => {
//   anchor.setProvider(anchor.AnchorProvider.env())
//   const provider = anchor.getProvider()

//   const connection = provider.connection

//   const program = new Program<GrpxDprotocols>(IDL, provider)
//   console.log(program.programId.toBase58())

//   const tokenProgram = TOKEN_2022_PROGRAM_ID

//   const confirm = async (signature: string): Promise<string> => {
//     const block = await connection.getLatestBlockhash()

//     await connection.confirmTransaction({
//       signature,
//       ...block,
//     })

//     return signature
//   }

//   const log = async (signature: string): Promise<string> => {
//     console.log(
//       `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`,
//     )

//     return signature
//   }

//   const [maker, taker, tokenMintA, tokenMintB] = Array.from({ length: 4 }, () => Keypair.generate())

//   const [makerTokenAccountA, makerTokenAccountB, takerTokenAccountA, takerTokenAccountB] = [maker, taker]
//     .map((a) =>
//       [tokenMintA, tokenMintB].map((m) => getAssociatedTokenAddressSync(m.publicKey, a.publicKey, false, tokenProgram)),
//     )
//     .flat()

//   const id = new BN(randomBytes(8))
//   const offer = PublicKey.findProgramAddressSync(
//     [Buffer.from('offer'), maker.publicKey.toBuffer(), id.toArrayLike(Buffer, 'le', 8)],
//     program.programId,
//   )[0]

//   const vault = getAssociatedTokenAddressSync(tokenMintA.publicKey, offer, true, tokenProgram)

//   const accounts = {
//     maker: maker.publicKey,
//     taker: taker.publicKey,
//     tokenMintA: tokenMintA.publicKey,
//     tokenMintB: tokenMintB.publicKey,
//     makerTokenAccountA,
//     makerTokenAccountB,
//     takerTokenAccountA,
//     takerTokenAccountB,
//     offer,
//     vault,
//     tokenProgram,
//   }

//   it('Airdrop and create mint', async () => {
//     let lamports = await getMinimumBalanceForRentExemptMint(connection)

//     let tx = new Transaction()

//     tx.instructions = [
//       ...[maker, taker].map((a) =>
//         SystemProgram.transfer({
//           fromPubkey: provider.publicKey,
//           toPubkey: a.publicKey,
//           lamports: 1 * LAMPORTS_PER_SOL,
//         }),
//       ),
//       ...[tokenMintA, tokenMintB].map((m) =>
//         SystemProgram.createAccount({
//           fromPubkey: provider.publicKey,
//           newAccountPubkey: m.publicKey,
//           lamports,
//           space: MINT_SIZE,
//           programId: tokenProgram,
//         }),
//       ),
//       ...[
//         { mint: tokenMintA.publicKey, authority: maker.publicKey, ata: makerTokenAccountA },
//         { mint: tokenMintB.publicKey, authority: taker.publicKey, ata: takerTokenAccountB },
//       ].flatMap((x) => [
//         createInitializeMint2Instruction(x.mint, 6, x.authority, null, tokenProgram),
//         createAssociatedTokenAccountIdempotentInstruction(provider.publicKey, x.ata, x.authority, x.mint, tokenProgram),
//         createMintToInstruction(x.mint, x.ata, x.authority, 1e9, undefined, tokenProgram),
//       ]),
//     ]

//     await provider.sendAndConfirm(tx, [maker, taker, tokenMintA, tokenMintB]).then(log)
//   })

//   it('MakeOffer', async () => {
//     await program.methods
//       .open(id, new BN(1e6), new BN(1e6))
//       .accounts({ ...accounts })
//       .signers([maker])
//       .rpc()
//       .then(confirm)
//       .then(log)
//   })

//   //   it('Refund', async () => {
//   //     await program.methods
//   //       .refund()
//   //       .accounts({ ...accounts })
//   //       .signers([maker])
//   //       .rpc()
//   //       .then(confirm)
//   //       .then(log)
//   //   })

//   //   it('Take', async () => {
//   //     await program.methods
//   //       .take()
//   //       .accounts({ ...accounts })
//   //       .signers([taker])
//   //       .rpc()
//   //       .then(confirm)
//   //       .then(log)
//   //   })
// })
