import { useState } from 'react'
import { ArrowRight, Check, Info } from 'lucide-react'
import { useAcceptOffer } from '@/hooks/use-accept-offer'
import { getIdenticon } from '@/lib/utils'
import { AppModal } from '@/components/app-modal'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { OfferResource } from '@/schemas/offer'
import api, { ApiResponse } from '@/lib/api'
import { OrderResource } from '@/schemas/order'

export function NFTPurchaseModal({ selectedOffer }: { selectedOffer: OfferResource }) {
  const [open, setOpen] = useState(false)
  const mutation = useAcceptOffer()

  const handleSubmit = async () => {
    try {
      const response = await mutation.mutateAsync({ offerObj: selectedOffer })
      if (!response) return toast.error('Failed to secure offer. Please try again.')

      const { consumer, status, txSignature } = response
      const { data: order } = await api<ApiResponse<{ data: OrderResource; success: boolean }>>(
        `offers/${selectedOffer._id}`,
        {
          method: 'PATCH',
          body: {
            status: status === 'accepted' ? 'in_progress' : 'failed',
            consumer,
            txSignature,
          },
        },
      )

      if (order.data.status === 'awaiting_delivery') {
        toast.success(`Order placed successfully!`)
        setOpen(false)
      }
    } catch (error) {
      console.error('Error purchasing NFT:', error)
      toast.error('Failed to purchase NFT. Please try again.')
    }
  }
  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      classes={`w-fit border-1 bg-yellow-500 text-green-950 hover:!text-green-900 hover:!bg-green-400 my-4 rounded-md !mt-0 h-10`}
      title="Purchase"
      submitDisabled={mutation.isPending}
      submitLabel={
        <>
          {mutation.isPending ? (
            <span className="flex items-center">
              Processing
              <span className="ml-2 h-4.5 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </span>
          ) : (
            <span className="flex items-center">
              Confirm Purchase
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </>
      }
      submit={handleSubmit}
      override={true}
      innerTitle={
        <DialogHeader>
          <DialogTitle>Accept Offer*</DialogTitle>
          <span className="text-xs font-medium italic mb-6 max-w-lg leading-5 text-muted-foreground/80">
            By accepting this offer, you agree to the terms of the Solana-based escrow contract securing this
            transaction*
          </span>
        </DialogHeader>
      }
      innerClasses="sm:max-w-[500px]"
    >
      {/* <DialogContent className="sm:max-w-[525px]"> */}
      {/* <DialogHeader>
          <DialogTitle>Accept Offer*</DialogTitle>
          <span className="text-xs italic mb-6">
            By accepting this offer, you agree to the terms of the Solana-based escrow contract securing this
            transaction*
          </span>
        </DialogHeader> */}

      <div className="grid gap-4 space-y-2">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 relative rounded-full overflow-hidden">
            <img src={getIdenticon(selectedOffer._id)} className="object-cover" />
          </div>
          <div className="flex flex-col space-y-1">
            <h3 className="font-medium">Château Margaux 2015</h3>
            <p className="text-sm text-muted-foreground">2015 • Bordeaux, France</p>
            <p className="text-sm font-bold mt-1 font-mono">{selectedOffer.sellingPrice} SOL</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400">What you'll get..</h4>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2 text-gray-500 dark:text-primary">
              <Check className="h-4 w-4 text-green-500" />
              Digital proof of ownership
            </li>
            <li className="flex items-center gap-2 text-gray-500 dark:text-primary">
              <Check className="h-4 w-4 text-green-500" />
              Complete supply chain history
            </li>
            <li className="flex items-center gap-2 text-gray-500 dark:text-primary">
              <Check className="h-4 w-4 text-green-500" />
              Option to redeem physical bottle
            </li>
            <li className="flex items-center gap-2 text-gray-500 dark:text-primary">
              <Check className="h-4 w-4 text-green-500" />
              Access to exclusive wine events
            </li>
          </ul>
        </div>

        <div className="bg-muted/40 p-3 rounded-md text-sm">
          <div className="flex justify-between mb-1">
            <span>Price</span>
            <span className="font-mono">
              {selectedOffer.sellingPrice}{' '}
              <span className="text-[0.75em] tracking-wider text-muted-foreground/80">SOL</span>
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
              {(selectedOffer.sellingPrice + 0.0085).toFixed(3)}{' '}
              <span className="text-[0.75em] tracking-wider">SOL</span>
            </span>
          </div>
        </div>
      </div>
      {/* <DialogContent>
   
      </DialogContent> */}
      {/* <DialogFooter>
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

          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <span className="flex items-center">
                Processing
                <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </span>
            ) : (
              <span className="flex items-center">
                Confirm Purchase
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </DialogFooter> */}
      {/* </DialogContent> */}
    </AppModal>
  )
}
