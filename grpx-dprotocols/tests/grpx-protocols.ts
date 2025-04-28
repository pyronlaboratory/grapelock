import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import type NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { AnchorProvider, Program, setProvider, Wallet } from '@coral-xyz/anchor'
import { PublicKey, Keypair, SystemProgram, Connection, Cluster } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { GrpxDprotocols } from '../target/types/grpx_dprotocols'
import { getExplorerLink } from '@solana-developers/helpers'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
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

// local testing using bankrun
describe('grpx-protocols', async () => {
  let connection: Connection
  let wallet: Wallet | NodeWallet
  let provider: BankrunProvider | AnchorProvider
  let program: Program<GrpxDprotocols>
  let mintAuthority: PublicKey
  let collection: Keypair

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
      connection = new Connection(process.env.RPC_URL!, 'confirmed') // new Connection(clusterApiUrl('devnet'), 'confirmed')
      const walletKeypair = loadKeypair(path.resolve(process.env.HOME || '', '.config/solana/id.json'))
      wallet = new Wallet(walletKeypair)
      provider = new AnchorProvider(connection, wallet, {
        commitment: 'processed',
      })
      setProvider(provider)
      program = new Program<GrpxDprotocols>(IDL, provider)
    }

    mintAuthority = PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0]
    collection = Keypair.generate()
  })

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

  it('Create NFT Collection', async () => {
    console.log('Collection Mint Key: ', collection.publicKey.toBase58())

    const metadata = await getMetadata(collection.publicKey)
    expect(metadata).to.not.be.null
    console.log('Collection Metadata Account: ', metadata.toBase58())

    const masterEdition = await getMasterEdition(collection.publicKey)
    expect(masterEdition).to.not.be.null
    console.log('Master Edition Account: ', masterEdition.toBase58())

    const destination = getAssociatedTokenAddressSync(collection.publicKey, wallet.payer.publicKey)
    expect(destination).to.not.be.null
    console.log('Destination Assoc. Token Account: ', destination.toBase58())

    const tx = await program.methods
      .createCollection()
      .accountsPartial({
        user: wallet.publicKey,
        mint: collection.publicKey,
        mintAuthority,
        metadata,
        masterEdition,
        destination,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([collection])
      .rpc({
        skipPreflight: true,
      })

    const cluster = (process.env.CLUSTER === 'local' ? 'localnet' : process.env.CLUSTER) as Cluster | 'localnet'
    console.log(`\nCreated Collection 📦! NFT Minted: TxID - ${getExplorerLink('transaction', tx, cluster)}`)

    if (process.env.CLUSTER !== 'local') {
      const accountInfo = await connection.getAccountInfo(destination)
      expect(accountInfo).to.not.be.null
      expect(accountInfo.data.length).to.be.greaterThan(0)
    }
  })
})
