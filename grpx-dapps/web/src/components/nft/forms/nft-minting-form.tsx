'use client'
import api, { ApiResponse } from '@/lib/api'
import { MintNFTFormResource, mintNFTFormSchema, NFTResource, NFTType } from '@/schemas/nft'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWallet } from '@solana/wallet-adapter-react'
import { useJobMonitor } from '@/hooks/use-job-monitor'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormUploadField } from '@/components/ui/form-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { Check, ChevronLeft, ChevronRight, Info, Loader2, PackagePlus, Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

type NFTTypeCardProps = {
  emoji: string
  title: string
  description: string
  features: string[]
  onClick: () => void
}
function NFTTypeCard({ emoji, title, description, features, onClick }: NFTTypeCardProps) {
  return (
    <Card
      className="cursor-pointer border-2 shadow-none hover:border-purple-400 hover:shadow-md transition-all bg-accent/40 dark:hover:bg-black"
      onClick={onClick}
    >
      <CardContent className="mt-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-300 rounded-full flex items-center justify-center mb-4">
          <span className="text-8xl">{emoji}</span>
        </div>
        <h3 className="text-xl font-bold my-2">{title}</h3>
        <p className="text-gray-500 dark:text-muted-foreground mb-8 text-sm max-w-[256px] text-pretty">{description}</p>
      </CardContent>
    </Card>
  )
}
function NFTTypeSelection({ selectType }: any) {
  return (
    <div className="mx-auto">
      <h1 className="text-accent-foreground/60 uppercase text-sm font-semibold italic text-center pb-4">
        Select asset type
      </h1>
      <Card className="w-fit mb-0 shadow-none gap-2 border-none p-0 !bg-transparent">
        <CardContent className="space-y-8 px-0">
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <NFTTypeCard
              emoji="🍾"
              title="Single Mint"
              description="Register a single, unique wine bottle as an NFT"
              features={[
                'Perfect for rare, collectible wines',
                'Detailed provenance tracking',
                'Individual environmental monitoring',
              ]}
              onClick={() => selectType('single')}
            />

            <NFTTypeCard
              emoji="📦"
              title="Collection Bundle"
              description="Register multiple bottles, cases, or barrels as a single NFT"
              features={[
                'Ideal for cases, barrels, or collections',
                'Efficient for bulk shipments',
                'Simplified logistics tracking',
              ]}
              onClick={() => selectType('batch')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export function NFTMintingForm({ data, onSuccess }: { data?: Object | null; onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTypeSelection, setShowTypeSelection] = useState(true)
  const [activeTab, setActiveTab] = useState('basic')
  const { enqueue } = useJobMonitor()

  const wallet = useWallet()
  if (!wallet.publicKey) return

  const form = useForm<MintNFTFormResource>({
    resolver: zodResolver(mintNFTFormSchema),
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      batchSize: null,
      batchType: null,
      nftType: 'single',
      nftName: '',
      nftSymbol: '',
      nftDescription: '',
      nftMedia: '',
      nftExternalUrl: '',
      nftAttributes: [],
      creatorAddress: wallet.publicKey?.toBase58() ?? '',
      sellerFeeBasisPoints: 0,
      collectionId: data?.toString(),
    },
  })
  const nftType = form.watch('nftType')
  const nftAttributes = form.watch('nftAttributes') || []

  const selectType = (type: NFTType) => {
    form.setValue('nftType', type)
    setShowTypeSelection(false)
  }
  const addAttribute = () => {
    const currentAttributes = form.getValues('nftAttributes') || []
    form.setValue('nftAttributes', [...currentAttributes, { trait_type: '', value: '' }])
  }
  const removeAttribute = (index: number) => {
    const currentAttributes = form.getValues('nftAttributes') || []
    form.setValue(
      'nftAttributes',
      currentAttributes.filter((_, i) => i !== index),
    )
  }
  async function onSubmit(formData: MintNFTFormResource) {
    setIsSubmitting(true)
    console.log('Form submitted:', JSON.stringify(formData))

    try {
      const response = await api<
        ApiResponse<{
          data: NFTResource
          jobId: string
          jobStatus: 'queued' | 'processing' | 'success' | 'failed'
        }>
      >('nfts/mint', {
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

  return showTypeSelection ? (
    <NFTTypeSelection selectType={selectType} />
  ) : (
    <div className="!min-w-xl">
      <TooltipProvider>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nftName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <div className="inline-flex justify-between">
                          <FormLabel>Display Name</FormLabel>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>Display name for the NFT</TooltipContent>
                          </Tooltip>
                        </div>

                        <FormControl>
                          <Input placeholder="Château Solenne" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nftSymbol"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <div className="inline-flex justify-between">
                          <FormLabel>Symbol</FormLabel>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>Short symbol (e.g. WINE)</TooltipContent>
                          </Tooltip>
                        </div>

                        <FormControl>
                          <Input placeholder="CSE2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {nftType === 'batch' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-baseline">
                    <FormField
                      control={form.control}
                      name="batchType"
                      render={({ field }) => (
                        <FormItem>
                          <div className="inline-flex justify-between">
                            <FormLabel>Container Type</FormLabel>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>Container used for packing—case, barrel, or container</TooltipContent>
                            </Tooltip>
                          </div>
                          <Select onValueChange={field.onChange} defaultValue={field.value || 'CASE'}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select bundle type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CASE">Wine Case (12 bottles)</SelectItem>
                              <SelectItem value="BARREL">Wine Barrel</SelectItem>
                              <SelectItem value="PALLET">Shipping Pallet</SelectItem>
                              <SelectItem value="CONTAINER">Transport Container</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="batchSize"
                      render={({ field }) => (
                        <FormItem>
                          <div className="inline-flex justify-between">
                            <FormLabel>Quantity (in gallons)</FormLabel>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>Quantity of physical asset</TooltipContent>
                            </Tooltip>
                          </div>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Number of units"
                              // {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : '')}
                              defaultValue="12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

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
                  name="nftDescription"
                  render={({ field }) => (
                    <FormItem>
                      <div className="inline-flex justify-between">
                        <FormLabel>Description</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>Description of the NFT and wine product</TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Textarea placeholder="Description of the NFT and wine product" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="metadata" className="space-y-6">
                <FormField
                  control={form.control}
                  name="nftMedia"
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
                        error={!!form.formState.errors.nftMedia}
                        disabled={form.formState.isSubmitting}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nftExternalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="inline-flex justify-between">
                        <FormLabel>External URL</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>Link to your external resource or website</TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input placeholder="Link to external website or details page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="nftAttributes"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <div className="inline-flex justify-between">
                        <FormLabel>Attributes</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>Asset attributes</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-sidebar-primary">
                            <tr>
                              <th className="px-4 py-2 text-left">Trait Type</th>
                              <th className="px-4 py-2 text-left">Value</th>
                              <th className="px-4 py-2 w-16"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {nftAttributes.length > 0 ? (
                              nftAttributes.map((_, index) => (
                                <tr key={index} className="border-t">
                                  <td className="px-4 py-2">
                                    <FormField
                                      control={form.control}
                                      name={`nftAttributes.${index}.trait_type`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input placeholder="Trait type" className="h-8" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <FormField
                                      control={form.control}
                                      name={`nftAttributes.${index}.value`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input placeholder="Value" className="h-8" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => removeAttribute(index)}
                                    >
                                      ✕
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr className="border-t">
                                <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                                  No attributes added yet. Click <b>Add Attribute</b> to add custom traits.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={addAttribute}
                        className="w-fit border-none"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Attribute
                      </Button>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    activeTab === 'metadata' ? setActiveTab('basic') : setShowTypeSelection(true)
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              </div>
              <div className="flex gap-3">
                {activeTab === 'basic' ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setActiveTab('metadata')
                    }}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                        Mint NFT
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </TooltipProvider>

      <div className="w-full mt-6 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{
            width: activeTab === 'basic' ? '50%' : '100%',
          }}
        />
      </div>
    </div>
  )
}
