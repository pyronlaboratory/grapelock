import 'dotenv/config'
import fs from 'fs'
import path from 'path'

import { AnchorProvider, Program, setProvider, Wallet, web3 } from '@coral-xyz/anchor'
import { PublicKey, Keypair, SystemProgram, Connection, Cluster, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token'
import { GrpxDprotocols } from '../target/types/grpx_dprotocols'

import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import type NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'

import { getExplorerLink } from '@solana-developers/helpers'
import { expect } from 'chai'

const IDL = require('../target/idl/grpx_dprotocols.json')
const PROGRAM_ID = new PublicKey(IDL.address)
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

// Load the local keypair for testing
const loadKeypair = (filename: string): Keypair => {
  const keypairFile = fs.readFileSync(filename, 'utf-8')
  const keypairData = JSON.parse(keypairFile)
  return Keypair.fromSecretKey(new Uint8Array(keypairData))
}

describe('grpx-protocols/factory', async () => {
  let connection: Connection
  let wallet: Wallet | NodeWallet
  let provider: BankrunProvider | AnchorProvider
  let program: Program<GrpxDprotocols>

  let mintAuthority: PublicKey
  let collectionMint: Keypair
  let mint: Keypair

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

  before(async () => {
    const CLUSTER = process.env.CLUSTER
    if (CLUSTER === 'local') {
      const context = await startAnchor(
        '',
        [
          { name: 'grpx_dprotocols', programId: PROGRAM_ID },
          { name: 'token_metadata', programId: TOKEN_METADATA_PROGRAM_ID },
        ],
        [],
      )
      provider = new BankrunProvider(context)
      wallet = provider.wallet as NodeWallet
      program = new Program<GrpxDprotocols>(IDL, provider)
    } else {
      console.log('Connecting to ', process.env.RPC_URL)
      connection = new Connection(process.env.RPC_URL!, 'confirmed')
      const walletKeypair = loadKeypair(path.resolve(process.env.HOME || '', '.config/solana/id.json'))
      wallet = new Wallet(walletKeypair)
      provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
      })
      setProvider(provider)
      program = new Program<GrpxDprotocols>(IDL, provider)
    }
    console.log('Loaded program: ', program.programId.toBase58())
    mintAuthority = PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0]

    collectionMint = Keypair.generate()
    mint = Keypair.generate()

    const lamportsNeeded = 1 * web3.LAMPORTS_PER_SOL
    const balance = await connection?.getBalance(wallet.publicKey)
    console.log('Wallet Balance: ', balance / web3.LAMPORTS_PER_SOL, 'SOL')

    if (balance < lamportsNeeded && process.env.CLUSTER === 'local') {
      console.log('Low balance, requesting airdrop...')
      const [latestBlockhash, airdropSig] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(wallet.publicKey, lamportsNeeded),
      ])
      await connection.confirmTransaction({ signature: airdropSig, ...latestBlockhash }, 'confirmed')
      console.log('Airdrop completed.')
    }
  })

  it('ForgeCollection', async () => {
    console.log('Collection Mint Key: ', collectionMint.publicKey.toBase58())

    const metadata = await getMetadata(collectionMint.publicKey)
    expect(metadata).to.not.be.null
    console.log('Collection Metadata Account: ', metadata.toBase58())

    const masterEdition = await getMasterEdition(collectionMint.publicKey)
    expect(masterEdition).to.not.be.null
    console.log('Master Edition Account: ', masterEdition.toBase58())

    const destination = getAssociatedTokenAddressSync(collectionMint.publicKey, wallet.payer.publicKey)
    expect(destination).to.not.be.null
    console.log('Destination Assoc. Token Account: ', destination.toBase58())

    const tx = await program.methods
      .create({
        name: 'Unique',
        symbol: 'SYM',
        description: '',
        uri: '',
        sellerFeeBasisPoints: 500,
      })
      .accountsPartial({
        owner: wallet.publicKey,
        mint: collectionMint.publicKey,
        mintAuthority,
        metadata,
        masterEdition,
        destination,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([collectionMint])
      .rpc({
        skipPreflight: false,
        commitment: 'confirmed',
      })

    const cluster = (process.env.CLUSTER === 'local' ? 'localnet' : process.env.CLUSTER) as Cluster | 'localnet'
    console.log(`\nCreated Collection NFT: TxID - ${getExplorerLink('transaction', tx, cluster)}`)

    if (process.env.CLUSTER !== 'local') {
      const accountInfo = await connection.getAccountInfo(destination)
      expect(accountInfo).to.not.be.null
      expect(accountInfo.data.length).to.be.greaterThan(0)
    }
  })

  it('MintNFT', async () => {
    console.log('Mint Key: ', mint.publicKey.toBase58())

    const metadata = await getMetadata(mint.publicKey)
    expect(metadata).to.not.be.null
    console.log('Metadata Account: ', metadata.toBase58())

    const masterEdition = await getMasterEdition(mint.publicKey)
    expect(masterEdition).to.not.be.null
    console.log('Master Edition: ', masterEdition.toBase58())

    const destination = getAssociatedTokenAddressSync(mint.publicKey, wallet.payer.publicKey)
    console.log('Destination Assoc. Token Account:', destination.toBase58())

    const tx = await program.methods
      .mint({
        name: 'UniqueMint',
        symbol: 'MNT',
        description: '',
        uri: '',
        sellerFeeBasisPoints: 100,
      })
      .accountsPartial({
        owner: wallet.publicKey,
        destination,
        metadata,
        masterEdition,
        mint: mint.publicKey,
        mintAuthority,
        collectionMint: collectionMint.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([mint])
      .rpc({
        skipPreflight: false,
        commitment: 'confirmed',
      })
    console.log('\nNFT Minted! Your transaction signature', tx)
    console.table(tx)
  })

  it('AuditCollection', async () => {
    const mintMetadata = await getMetadata(mint.publicKey)
    console.log('\nMint Metadata', mintMetadata.toBase58())

    const collectionMetadata = await getMetadata(collectionMint.publicKey)
    console.log('Collection Metadata', collectionMetadata.toBase58())

    const collectionMasterEdition = await getMasterEdition(collectionMint.publicKey)
    console.log('Collection Master Edition', collectionMasterEdition.toBase58())

    const tx = await program.methods
      .verify()
      .accountsPartial({
        authority: wallet.publicKey,
        metadata: mintMetadata,
        mint: mint.publicKey,
        mintAuthority,
        collectionMint: collectionMint.publicKey,
        collectionMetadata,
        collectionMasterEdition,
        systemProgram: SystemProgram.programId,
        sysvarInstruction: SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .rpc({
        skipPreflight: true,
      })
    console.log('\nCollection Verified! Your transaction signature', tx)
  })
})
