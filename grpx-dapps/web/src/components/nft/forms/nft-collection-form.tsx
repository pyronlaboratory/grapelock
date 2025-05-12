'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormUploadField } from '@/components/ui/form-upload'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useJobMonitor } from '@/hooks/use-job-monitor'
import api, { ApiResponse } from '@/lib/api'
import { CollectionResource, createCollectionFormSchema, CreateCollectionFormResource } from '@/schemas/collection'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWallet } from '@solana/wallet-adapter-react'
import { Check, ChevronLeft, ChevronRight, Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function NFTCollectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const wallet = useWallet()
  const [activeTab, setActiveTab] = useState('metadata')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { enqueue } = useJobMonitor()

  const nextTab = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (activeTab === 'metadata') setActiveTab('minting')
  }
  const prevTab = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (activeTab === 'minting') setActiveTab('metadata')
  }
  const form = useForm<CreateCollectionFormResource>({
    resolver: zodResolver(createCollectionFormSchema),
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      collectionName: '',
      collectionSymbol: '',
      collectionDescription: '',
      collectionMedia: '',
      creatorAddress: wallet.publicKey?.toBase58(),
      sellerFeeBasisPoints: 50,
      maxSupply: 0,
    },
  })
  async function onSubmit(formData: CreateCollectionFormResource) {
    setIsSubmitting(true)
    console.log('Form submitted:', JSON.stringify(formData))

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
  console.log(form.watch('collectionMedia'))
  return (
    <Card className="w-full md:w-xl">
      <CardHeader>
        <CardTitle>Create New Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 w-auto ">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="minting">Minting</TabsTrigger>
          </TabsList>

          <TooltipProvider>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <TabsContent value="metadata">
                  <div className="space-y-6">
                    <div className="flex gap-6 items-baseline">
                      <FormField
                        control={form.control}
                        name="collectionName"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <div className="inline-flex justify-between">
                              <FormLabel>Name</FormLabel>
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
                    <div className="space-y-6">
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
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="minting">
                  <div className="space-y-6">
                    <div className="border-1 text-sm text-sidebar-accent border-sidebar-primary-foreground dark:border-sidebar-primary bg-blue-400/80 p-4 rounded-md">
                      <strong className="flex gap-4 mb-2 tracking-normal">
                        <Info className="h-5 w-5" />
                        Minting Authority
                      </strong>

                      <p className="text-white dark:text-black">
                        The wallet used to create the collection controls the minting process and can mint new NFTs.
                        Once minted, NFTs can be transferred or sold, and the minting authority cannot manage them.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="creatorAddress"
                        render={({ field }) => (
                          <FormItem>
                            <div className="inline-flex justify-between">
                              <FormLabel>Creator Address</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Defaults to your connected wallet; Support for adding collaborators will be available
                                  soon
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-baseline">
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
                        name="maxSupply"
                        render={({ field }) => (
                          <FormItem>
                            <div className="inline-flex justify-between">
                              <FormLabel>Max Supply</FormLabel>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Total number of NFTs allowed in this collection (0 for unlimited)
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <FormControl>
                              <Input type="number" min="0" placeholder="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <div className="flex justify-between pt-4 z-10">
                  {activeTab !== 'metadata' && (
                    <Button type="button" variant="outline" onClick={prevTab}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                  )}

                  {activeTab !== 'minting' ? (
                    <Button type="button" className="ml-auto" onClick={nextTab}>
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" className="flex flex-row" disabled={isSubmitting || !form.formState.isValid}>
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
                  )}
                </div>
              </form>
            </Form>
          </TooltipProvider>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-6">
        <div className="w-full mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{
              width: activeTab === 'metadata' ? '50%' : '100%',
            }}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
