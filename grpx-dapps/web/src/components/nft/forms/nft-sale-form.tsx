'use client'
import { useState } from 'react'
import { AppModal } from '@/components/app-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMakeOffer } from '@/hooks/use-make-offer'
import { ellipsify } from '@/lib/utils'
import { Check, Copy, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@solana/wallet-adapter-react'

export function NFTSaleModal({
  isVerified,
  nftId,
  nftMintAddress,
  nftCreatorAddress,
}: {
  isVerified: boolean
  nftId: string
  nftMintAddress: string
  nftCreatorAddress: string
}) {
  const [price, setPrice] = useState('')
  const mutation = useMakeOffer()
  const wallet = useWallet()

  const handleSubmit = async () => {
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid selling price')
      return
    }

    try {
      await mutation.mutateAsync({
        nftMintAddress,
        creatorAddress: nftCreatorAddress,
        sellingPrice: parseFloat(price),
      })

      toast.success('NFT successfully listed for sale!')
    } catch (error) {
      console.error('Error listing NFT for sale:', error)
      toast.error('Failed to list NFT for sale. Please try again.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <AppModal
      classes={`font-semibold mb-6 text-primary/20 hover:!text-primary/40 ${
        isVerified
          ? '!cursor-pointer !bg-green-400 hover:!bg-green-300 !text-green-950 hover:!text-green-800'
          : '!cursor-not-allowed'
      }`}
      title="Ready for Sale"
      submitDisabled={mutation.isPending}
      submitLabel={
        <>
          <Check />
          {mutation.isPending ? 'Publishing...' : 'Publish'}
        </>
      }
      submit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md bg-green-400/80 border p-2.5 text-green-950">
          <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-4.5 font-semibold">
            When listed, your NFT will be held in a protective escrow until sold or delisted. During this time, it won't
            be available in your wallet but remains securely stored on the blockchain.
          </p>
        </div>

        <div>
          <div className="relative">
            <Input
              disabled={mutation.isPending}
              id="amount"
              min="0.001"
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Set asking price.."
              type="number"
              step="any"
              value={price}
              className="pr-12 h-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">SOL</div>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Asset Mint</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{ellipsify(nftMintAddress)}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(nftMintAddress)}>
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy address</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Creator Address</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{ellipsify(nftCreatorAddress)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => copyToClipboard(nftCreatorAddress)}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy address</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  )
}

// Archived
// export function ReadyForSaleModal({
//   isVerified,
//   nftId,
//   nftMintAddress,
//   nftCreatorAddress,
// }: {
//   isVerified: boolean
//   nftId: string
//   nftMintAddress: string
//   nftCreatorAddress: string
// }) {
//   const address = new PublicKey('EpmGcK3Uc73ncnnTn2a5gRnCuz1C8UsqKRdpkt4WJbRj')
//   const mutation = useMakeOffer()

//   const [amount, setAmount] = useState('1')
//   const [amountB, setAmountB] = useState('1')

//   const { wallet, publicKey, signTransaction, signAllTransactions, connected } = useWallet()
//   if (!wallet || !publicKey) return
//   if (!address || !wallet?.adapter.sendTransaction) {
//     return <div>Wallet not connected</div>
//   }

//   const nftMint = new PublicKey(nftMintAddress)
//   const handleSubmit = async () => {
//     const tokenMintB = new PublicKey('So11111111111111111111111111111111111111112')
//     const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, 'confirmed')

//     if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
//       toast.error('Wallet not connected')
//       return
//     }

//     const anchorWallet = {
//       publicKey,
//       signTransaction,
//       signAllTransactions,
//     }

//     const provider = new AnchorProvider(connection, anchorWallet, {
//       commitment: 'confirmed',
//     })

//     const program = new Program<GrpxDprotocols>(IDL, provider)

//     try {
//       await mutation.mutateAsync({
//         program,
//         maker: publicKey,
//         tokenMintA: new PublicKey(nftMintAddress),
//         tokenMintB,
//         amountA: new BN(1), // 1 NFT
//         amountB: new BN(Number.parseFloat(amountB) * 1_000_000),
//         makerTokenAccountA: getAssociatedTokenAddressSync(nftMint, publicKey),
//         // makerTokenAccountA: new PublicKey(publicKey),
//         makerTokenAccountB: null,
//         connection,
//       })
//     } catch (e) {
//       console.error('Transaction failed:', e)
//       toast.error('Transaction failed. See console for details.')
//     }
//   }

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text)
//     toast.success('Copied to clipboard')
//   }

//   return (
//     <AppModal
//       classes={`font-semibold mb-6 text-primary/20 hover:!text-primary/40 ${
//         isVerified
//           ? '!cursor-pointer !bg-green-400 hover:!bg-green-300 !text-green-950 hover:!text-green-800'
//           : '!cursor-not-allowed'
//       }`}
//       title="Ready for Sale"
//       submitDisabled={!amount || mutation.isPending || Number(amountB) <= 0}
//       submitLabel={
//         <>
//           <Check />
//           Publish
//         </>
//       }
//       submit={handleSubmit}
//     >
//       <div className="space-y-4">
//         <div className="flex items-start gap-2 rounded-md bg-green-400/80 border p-2.5 text-green-950">
//           <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
//           <p className="text-xs leading-4.5 font-semibold">
//             When listed, your NFT will be held in a protective escrow until sold or delisted. During this time, it won't
//             be available in your wallet but remains securely stored on the blockchain.
//           </p>
//         </div>

//         <div>
//           <div className="relative">
//             <Input
//               disabled={mutation.isPending}
//               id="amount"
//               min="0.001"
//               onChange={(e) => setAmountB(e.target.value)}
//               placeholder="Set asking price.."
//               type="number"
//               step="any"
//               value={amountB}
//               className="pr-12 h-10"
//             />
//             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">SOL</div>
//           </div>
//         </div>

//         <div className="rounded-md border p-3 space-y-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-1.5">
//               <span className="text-xs text-muted-foreground">Asset Mint</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <span className="text-xs font-medium">{ellipsify(nftMintAddress)}</span>
//               <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(nftMintAddress)}>
//                 <Copy className="h-3 w-3" />
//                 <span className="sr-only">Copy address</span>
//               </Button>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-1.5">
//               <span className="text-xs text-muted-foreground">Creator Address</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <span className="text-xs font-medium">{ellipsify(nftCreatorAddress)}</span>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-5 w-5"
//                 onClick={() => copyToClipboard(nftCreatorAddress)}
//               >
//                 <Copy className="h-3 w-3" />
//                 <span className="sr-only">Copy address</span>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AppModal>
//   )
// }

// const SOL_MINT_ADDRESS = new PublicKey('So11111111111111111111111111111111111111112')
// const getRandomBigNumber = (size = 8) => {
//   return new BN(randomBytes(size))
// }
// const makeOffer = async ({
//   connection,
//   wallet,
//   nftMintAddress,
//   nftAmount,
//   solAmount,
// }: {
//   connection: any
//   wallet: any
//   nftMintAddress: PublicKey
//   nftAmount: number
//   solAmount: number
// }) => {
//   // const [alicePublicKey] = await wallet.publicKey.toBase58()
//   const alicePublicKey = wallet.publicKey
//   const transaction = new Transaction()
//   const PROGRAM_ID = new PublicKey(IDL.address)

//   // Generate Offer and Vault Addresses for Alice
//   const offerId = getRandomBigNumber()
//   console.log('offerId:', offerId)
//   const offerPDA = PublicKey.findProgramAddressSync(
//     [Buffer.from('offer'), alicePublicKey.toBuffer(), offerId.toArrayLike(Buffer, 'le', 8)],
//     PROGRAM_ID,
//   )[0]

//   const vault = getAssociatedTokenAddressSync(nftMintAddress, offerPDA, true, TOKEN_PROGRAM_ID)

//   // Create an associated token account if necessary for Alice's NFT
//   const createVaultInstructions = createAssociatedTokenAccountIdempotentInstruction(
//     alicePublicKey,
//     vault,
//     alicePublicKey,
//     nftMintAddress,
//     TOKEN_PROGRAM_ID,
//   )

//   // Assuming the mint is already initialized, mint tokens to Alice's vault
//   const mintToInstructions = createMintToInstruction(
//     nftMintAddress,
//     vault,
//     alicePublicKey,
//     nftAmount,
//     [],
//     TOKEN_PROGRAM_ID,
//   )

//   // Add the instructions to the transaction
//   transaction.add(createVaultInstructions, mintToInstructions)

//   // Prepare the transaction and send it
//   const { blockhash } = await connection.getRecentBlockhash()
//   transaction.recentBlockhash = blockhash
//   transaction.feePayer = alicePublicKey

//   const signedTransaction = await wallet.sendTransaction(transaction, connection)
//   await connection.confirmTransaction(signedTransaction)

//   return signedTransaction
// }

// export const OfferNFTAndGetSOL = ({ mintAddress }: any) => {
//   if (!mintAddress) return
//   const { connection } = useConnection()
//   const wallet = useWallet()
//   if (!wallet || !wallet.publicKey) return
//   const queryClient = useQueryClient()

//   const [nftAmount, setNftAmount] = useState(1)
//   const [solAmount, setSolAmount] = useState(1)

//   const { data: nftTokenAccounts } = useGetTokenAccounts({ address: wallet.publicKey })
//   const { data: balanceData } = useGetBalance({ address: wallet.publicKey })

//   const mutation = useMutation({
//     mutationKey: ['make-offer'],
//     mutationFn: (data: any) => makeOffer(data),
//     onSuccess: (signature) => {
//       console.log(`Offer created with signature: ${signature}`)
//       // queryClient.invalidateQueries(['get-balance'])
//       // queryClient.invalidateQueries(['get-token-accounts'])
//     },
//   })

//   const handleMakeOffer = async () => {
//     if (wallet.publicKey) {
//       const nftMintAddress = new PublicKey(mintAddress)
//       await mutation.mutateAsync({
//         connection,
//         wallet,
//         nftMintAddress,
//         nftAmount,
//         solAmount,
//       })
//     }
//   }

//   return (
//     <div>
//       <h2>Create Contract: Offer NFT for {mintAddress.toString()} SOL</h2>
//       <div>
//         <label>
//           NFT Amount:
//           <input type="number" value={nftAmount} onChange={(e) => setNftAmount(Number(e.target.value))} min={1} />
//         </label>
//       </div>
//       <div>
//         <label>
//           SOL Amount:
//           <input type="number" value={solAmount} onChange={(e) => setSolAmount(Number(e.target.value))} min={1} />
//         </label>
//       </div>

//       <Button onClick={handleMakeOffer} disabled={!wallet.publicKey || mutation.isPending}>
//         {mutation.isPending ? 'Creating offer...' : 'Make Offer'}
//       </Button>

//       <div>
//         <h3>Your Balance</h3>
//         <p>SOL Balance: {balanceData}</p>
//         <p>NFTs: {nftTokenAccounts?.length}</p>
//       </div>
//     </div>
//   )
// }
