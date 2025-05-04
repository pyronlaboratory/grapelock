import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormUploadField } from '@/components/ui/form-upload'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useJobMonitor } from '@/hooks/use-job-monitor'
import api, { ApiResponse } from '@/lib/api'
import { CollectionType, createCollectionFormSchema, CreateCollectionFormType } from '@/schemas/collection'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWallet } from '@solana/wallet-adapter-react'
import { Check, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function NFTCollectionForm() {
  const wallet = useWallet()
  const [activeTab, setActiveTab] = useState('metadata')
  const { enqueue } = useJobMonitor()

  const nextTab = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (activeTab === 'metadata') setActiveTab('minting')
  }
  const prevTab = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (activeTab === 'minting') setActiveTab('metadata')
  }
  const form = useForm<CreateCollectionFormType>({
    resolver: zodResolver(createCollectionFormSchema),
    defaultValues: {
      collectionName: '',
      collectionSymbol: '',
      collectionDescription: '',
      collectionMedia: '',
      creatorAddress: wallet.publicKey?.toBase58(),
      creatorShare: 100,
      sellerFee: 500,
      maxSupply: 0,
    },
  })
  async function onSubmit(payload: CreateCollectionFormType) {
    console.log('Form submitted:', JSON.stringify(payload))
    const response = await api<
      ApiResponse<{
        data: CollectionType
        jobId: string
        jobStatus: 'queued' | 'processing' | 'success' | 'failed'
      }>
    >('collections', {
      method: 'POST',
      body: payload,
    })
    console.log(response)
    const { success, data } = response
    if (success && data.jobStatus === 'queued') {
      enqueue({ jobId: data.jobId, status: 'queued' })
      toast(`Job ${data.jobId} queued`, { description: `Tracking job progress in background` })
    }
  }

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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <TabsContent value="metadata">
                <div className="space-y-6">
                  <div className="flex gap-8 items-baseline">
                    <FormField
                      control={form.control}
                      name="collectionName"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Premium Wines 2023" {...field} />
                          </FormControl>
                          <FormDescription>The name of your NFT collection</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="collectionSymbol"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Symbol</FormLabel>
                          <FormControl>
                            <Input placeholder="PW23" {...field} />
                          </FormControl>
                          <FormDescription>A short symbol for your collection</FormDescription>
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Winter Collection—2025" {...field} />
                        </FormControl>
                        <FormDescription>A short description for your collection</FormDescription>
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
                          <FormLabel>Media</FormLabel>
                          <FormUploadField
                            wallet={wallet}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            error={!!form.formState.errors.collectionMedia}
                            disabled={form.formState.isSubmitting}
                          />
                          <FormDescription>Link to your collection image or html (Arweave/IPFS)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="minting">
                <div className="space-y-6">
                  <div className="text-sm text-sidebar-accent border-sidebar-primary bg-blue-400/80 p-4 rounded-md">
                    <strong className="flex gap-4 mb-2 tracking-normal">
                      <Info className="h-5 w-5" />
                      Minting Authority
                    </strong>

                    <p className="text-neutral-650">
                      The wallet used to create the collection controls the minting process and can mint new NFTs. Once
                      minted, NFTs can be transferred or sold, and the minting authority cannot manage them.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="creatorAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator Address</FormLabel>

                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || wallet.publicKey?.toBase58()}
                              placeholder={wallet.publicKey?.toBase58()}
                              className="text-muted-foreground cursor-not-allowed opacity-40"
                              readOnly
                            />
                          </FormControl>
                          <FormDescription className="">
                            Defaults to your connected wallet; Support for adding collaborators will be available soon
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-baseline">
                    <FormField
                      control={form.control}
                      name="creatorShare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator Share (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormDescription>Percentage of earnings the creator will receive (0-100)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellerFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seller Fee (basis points)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="10000" placeholder="500" {...field} />
                          </FormControl>
                          <FormDescription>Royalty fee for secondary sales (500 = 5%)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="maxSupply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Supply</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="1000" {...field} />
                        </FormControl>
                        <FormDescription>
                          Total number of NFTs allowed in this collection (0 for unlimited)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <Button type="submit" className="flex flex-row">
                    <Check className="text-green-600" />
                    Create Collection
                  </Button>
                )}
              </div>
            </form>
          </Form>
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
