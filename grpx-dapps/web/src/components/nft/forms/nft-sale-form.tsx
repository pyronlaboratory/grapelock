'use client'
import api, { ApiResponse } from '@/lib/api'
import { useState } from 'react'
import { AppModal } from '@/components/app-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMakeOffer } from '@/hooks/use-make-offer'
import { ellipsify } from '@wallet-ui/react'
import { Check, Coins, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useWallet } from '@solana/wallet-adapter-react'
import { OfferResource } from '@/schemas/offer'
import { Separator } from '@/components/ui/separator'

export function NFTSaleModal({
  isVerified = false,
  isDisabled = false,
  nftId,
  nftCreatorAddress,
  nftTokenMintAddress,
  nftTokenAccountAddress,
}: {
  isVerified: boolean
  isDisabled: boolean
  nftId: string
  nftCreatorAddress: string
  nftTokenMintAddress: string
  nftTokenAccountAddress: string
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
        nftTokenMintAddress: nftTokenMintAddress,
        creatorAddress: nftCreatorAddress, // could be re-seller as well
        sellingPrice: parseFloat(price),
      })

      if (!response) return toast.error('Failed to list NFT for sale. Please try again.')

      const { data: offer } = await api<ApiResponse<{ data: OfferResource; success: boolean }>>('offers', {
        method: 'POST',
        body: {
          offer: response.offer,
          nftId,
          sellingPrice: parseFloat(price),
          producer: nftCreatorAddress || wallet.publicKey?.toBase58(),
          tokenMintA: response.tokenMintA,
          tokenMintB: response.tokenMintB,
          vaultTokenAccountA: response.vaultTokenAccountA,
          vaultTokenAccountB: response.vaultTokenAccountB,
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
      }${isDisabled ? '!cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
      title={`${isDisabled ? '' : '💰'} Ready for Sale`}
      submitDisabled={mutation.isPending || isDisabled}
      submitLabel={
        <>
          <Check />
          {mutation.isPending ? 'Signing...' : 'Deposit'}
        </>
      }
      submit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="text-sm border-1 text-accent-foreground dark:text-sidebar-accent !border-green-600 dark:border-accent-background bg-green-200/80 p-4 rounded-md">
          <strong className="flex gap-2 mb-2 tracking-normal">
            <Coins className="h-5 w-5" />
            Ensure Sufficient SOL
          </strong>

          <div className="mt-0">
            <p className="text-neutral-800">
              Escrow holdings requires additional gas fee on the blockchain — request an airdrop if needed{' '}
              <a href="#">here</a>
            </p>
          </div>
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
          <p className="text-[12px] mb-6 text-primary tracking-normal font-bold uppercase">Offer Summary</p>

          <p className="text-xs mb-2 text-muted-foreground/80 font-semibold uppercase">CREATOR</p>
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-primary font-medium">Producer</span>
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
          <Separator className="my-4" />
          <p className="text-xs mb-2 text-muted-foreground/80 font-semibold uppercase">ASSET</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-primary font-medium">Token Mint Address</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{ellipsify(nftTokenMintAddress || '—')}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => copyToClipboard(nftTokenMintAddress || 'nada')}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy address</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-primary font-medium">Token Account Address</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{ellipsify(nftTokenAccountAddress)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => copyToClipboard(nftTokenMintAddress)}
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
