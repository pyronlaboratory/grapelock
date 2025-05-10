import { AppModal } from '@/components/app-modal'
import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle, ArrowRight, Check, Info } from 'lucide-react'
import image from 'next/image'
import { useState } from 'react'
import { ellipsify, getCollectionIdenticon } from '../../../lib/utils'

export function NFTPurchaseModal({
  nftMintAddress,
  nftSellingPrice,
}: {
  nftMintAddress: string
  nftSellingPrice: number
}) {
  const [open, setOpen] = useState(false)
  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      classes={`hover:!text-green-900 hover:!bg-green-400 w-full my-6 rounded-md`}
      title="Purchase"
      //   submitDisabled={mutation.isPending}
      submitLabel={
        <>
          <Check />
          Purchase
          {/* {mutation.isPending ? 'Signing...' : 'Purchase'} */}
        </>
      }
      //   submit={handleSubmit}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase NFT</DialogTitle>
          <DialogDescription className="text-xs">
            You're about to purchase a digital certificate of authenticity and ownership for this wine.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 relative rounded overflow-hidden">
              <img src={getCollectionIdenticon('...')} className="object-cover" />
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="font-medium">Château Margaux 2015</h3>
              <p className="text-sm text-muted-foreground">2015 • Bordeaux, France</p>
              <p className="text-sm font-bold mt-1 font-mono">{nftSellingPrice} SOL</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-xs font-medium">What you'll get:</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Digital proof of ownership
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Complete supply chain history
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Option to redeem physical bottle
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Access to exclusive wine events
              </li>
            </ul>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="flex justify-between mb-1">
              <span>Price</span>
              <span className="font-mono">
                {nftSellingPrice} <span className="text-[0.75em] tracking-wider text-muted-foreground/80">SOL</span>
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Gas fee (est.)</span>
              <span className="font-mono">
                0.0085 <span className="text-[0.75em] tracking-wider text-muted-foreground/80">SOL</span>
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="font-mono  text-green-500">
                {(nftSellingPrice + 0.0085).toFixed(3)} <span className="text-[0.75em] tracking-wider">SOL</span>
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-muted-foreground mr-auto cursor-pointer">
                  <Info className="h-3 w-3 mr-1" />
                  How it works
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p>
                  This NFT represents ownership of a physical bottle of wine. The blockchain ensures authenticity and
                  tracks the wine's journey from vineyard to bottle.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button>
            {/* <Button onClick={handlePurchase} disabled={isPurchasing || isPurchaseComplete}> */}
            {/* {isPurchasing ? (
                  <span className="flex items-center">
                    Processing
                    <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </span>
                ) : isPurchaseComplete ? (
                  <span className="flex items-center">
                    Purchased
                    <Check className="ml-2 h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    Confirm Purchase
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )} */}
            <span className="flex items-center">
              Confirm Purchase
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </AppModal>
  )
}
