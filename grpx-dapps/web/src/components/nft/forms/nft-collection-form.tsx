'use client'
import api, { ApiResponse } from '@/lib/api'
import { CollectionResource, createCollectionFormSchema, CreateCollectionFormResource } from '@/schemas/collection'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useJobMonitor } from '@/hooks/use-job-monitor'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormUploadField } from '@/components/ui/form-upload'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Check, Info, Loader2 } from 'lucide-react'

export function NFTCollectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { enqueue } = useJobMonitor()
  const wallet = useWallet()
  if (!wallet.publicKey) return
  const form = useForm<CreateCollectionFormResource>({
    resolver: zodResolver(createCollectionFormSchema),
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      collectionName: '',
      collectionSymbol: '',
      collectionDescription: '',
      collectionMedia: '',
      creatorAddress: wallet.publicKey?.toBase58() ?? '',
      sellerFeeBasisPoints: 0,
    },
  })
  async function onSubmit(formData: CreateCollectionFormResource) {
    setIsSubmitting(true)

    // TODO: Move to mutation query
    try {
      const response = await api<
        ApiResponse<{
          data: CollectionResource
          jobId: string
          jobStatus: 'queued' | 'processing' | 'success' | 'failed'
        }>
      >('collections', {
        method: 'POST',
        body: formData,
      })
      const { success, data } = response
      if (success && data.jobStatus === 'queued') {
        enqueue({ jobId: data.jobId, status: 'queued' })
        toast(`Job ${data.jobId} queued`, { description: `Tracking job progress in background` })
        form.reset()
        onSuccess?.()
      }
    } catch (error) {
      toast.error('Error submitting form')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="w-full mt-2">
      <TooltipProvider>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="creatorAddress"
              render={({ field }) => (
                <FormItem>
                  <div className="inline-flex justify-between">
                    <FormLabel>Creator</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Defaults to your connected wallet; Support for adding collaborators will be available soon
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || wallet.publicKey?.toBase58()}
                      placeholder={wallet.publicKey?.toBase58()}
                      className="text-muted-foreground cursor-not-allowed opacity-40"
                      readOnly
                      tabIndex={-1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6 items-baseline">
              <FormField
                control={form.control}
                name="collectionName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="inline-flex justify-between">
                      <FormLabel>Display Name</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>The name of your NFT collection</TooltipContent>
                      </Tooltip>
                    </div>

                    <FormControl>
                      <Input placeholder="Premium Wines 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collectionSymbol"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="inline-flex justify-between">
                      <FormLabel>Symbol</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>A short symbol for your collection</TooltipContent>
                      </Tooltip>
                    </div>

                    <FormControl>
                      <Input placeholder="PW23" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="collectionDescription"
              render={({ field }) => (
                <FormItem>
                  <div className="inline-flex justify-between">
                    <FormLabel>Description</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>A short description for your collection</TooltipContent>
                    </Tooltip>
                  </div>

                  <FormControl>
                    <Textarea placeholder="Summer Harvest Collection—2025" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellerFeeBasisPoints"
              render={({ field }) => (
                <FormItem>
                  <div className="inline-flex justify-between">
                    <FormLabel>Seller Fee (basis points)</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>Royalty fee for secondary sales (500 = 5%)</TooltipContent>
                    </Tooltip>
                  </div>

                  <FormControl>
                    <Input type="number" min="0" max="10000" placeholder="500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collectionMedia"
              render={({ field }) => (
                <FormItem>
                  <div className="inline-flex justify-between">
                    <FormLabel>Media</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>Link to your collection image or html (Arweave/IPFS)</TooltipContent>
                    </Tooltip>
                  </div>

                  <FormUploadField
                    wallet={wallet}
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={!!form.formState.errors.collectionMedia}
                    disabled={form.formState.isSubmitting}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="ml-auto flex flex-row" disabled={isSubmitting || !form.formState.isValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="text-green-600" />
                  Create Collection
                </>
              )}
            </Button>
          </form>
        </Form>
      </TooltipProvider>
    </div>
  )
}
