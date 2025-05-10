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
import api, { ApiResponse } from '@/lib/api'
import { OfferResource } from '@/schemas/offer'

export function NFTSaleModal({
  isVerified,
  nftId,
  nftMintAddress,
  nftCreatorAddress,
}: {
  isVerified: boolean
  nftId: string
  nftCreatorAddress?: string
  nftMintAddress?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState('')
  const mutation = useMakeOffer()
  const wallet = useWallet()

  const handleSubmit = async () => {
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid selling price')
      return
    }

    try {
      const response = await mutation.mutateAsync({
        nftMintAddress: nftMintAddress || '',
        creatorAddress: nftCreatorAddress || '',
        sellingPrice: parseFloat(price),
      })
      // const response = {
      //   offer: '8dtxDPVNDhkMiuFagSeQjAZGyM5RY1iqSbFYjcPFEP3Z',
      //   vault: 'FzbUZE4vHyjeeoKFBuX9sG3endRGeJvFbQND5nXHGoEt',
      //   signature: '3Djwx3yfDZxQukCTjaCdWEeqB832ZhaAzyrPZzEDa1cvHnvPuFbmJ4WJVhoaT7YCEa52c2PYAytMui33q9gBW5gK',
      // }
      if (!response) return toast.error('Failed to list NFT for sale. Please try again.')

      const { data: offer } = await api<ApiResponse<{ data: OfferResource; success: boolean }>>('offers', {
        method: 'POST',
        body: {
          nftId,
          nftMintAddress,
          sellingPrice: parseFloat(price),
          producerAddress: nftCreatorAddress || wallet.publicKey?.toBase58(),
          offerAddress: response.offer,
          vaultAddress: response.vault,
          txSignature: response.signature,
        },
      })
      if (offer.data.status === 'open') {
        toast.success(`NFT successfully listed for sale!`)
        setOpen(false)
      }
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
      open={open}
      onOpenChange={setOpen}
      classes={`font-semibold mb-6 text-primary/20 hover:!text-primary/40 ${
        isVerified
          ? '!cursor-pointer !bg-green-400 hover:!bg-green-300 !text-green-950 hover:!text-green-800'
          : '!cursor-not-allowed text-black hover:!text-black/80'
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
            <div className="text-xs absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              SOL
            </div>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Asset Mint Address</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{ellipsify(nftMintAddress || '...')}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => copyToClipboard(nftMintAddress || 'nada')}
              >
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
                onClick={() => copyToClipboard(nftCreatorAddress || 'nada')}
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
