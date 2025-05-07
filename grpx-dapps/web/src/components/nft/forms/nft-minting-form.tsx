'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { NFTTypeSelection } from '../nft-ui'
import {
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Info,
  Loader2,
  PackagePlus,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  Wallet,
  Wine,
  Zap,
} from 'lucide-react'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { FormUploadField } from '@/components/ui/form-upload'
import { useWallet } from '@solana/wallet-adapter-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { MintNFTFormResource, mintNFTFormSchema, NFTResource, NFTType } from '@/schemas/nft'
import { toast } from 'sonner'
import api, { ApiResponse } from '@/lib/api'
import { useJobMonitor } from '@/hooks/use-job-monitor'

export function NFTMintingForm({ data, onSuccess }: { data?: Object | null; onSuccess?: () => void }) {
  const wallet = useWallet()
  if (!wallet.publicKey) return

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTypeSelection, setShowTypeSelection] = useState(true)
  const [activeTab, setActiveTab] = useState('metadata')
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
      sellerFeeBasisPoints: 50,
      maxSupply: 0,
      collectionId: data?.toString() || '',
    },
  })
  const nftType = form.watch('nftType')
  const attributes = form.watch('nftAttributes') || []
  const { enqueue } = useJobMonitor()
  const onSubmit = async (formData: MintNFTFormResource) => {
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

  const handleTypeSelection = (type: NFTType) => {
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

  const goToNextTab = () => {
    if (activeTab === 'metadata') setActiveTab('attributes')
    else if (activeTab === 'attributes') setActiveTab('signature')
  }
  const goToPrevTab = () => {
    if (activeTab === 'signature') setActiveTab('attributes')
    else if (activeTab === 'attributes') setActiveTab('metadata')
  }

  if (showTypeSelection) return <NFTTypeSelection handleTypeSelection={handleTypeSelection} />

  console.log('Errors:', form.formState.errors)
  console.log('Is Valid:', form.formState.isValid)
  console.log('Values:', form.getValues())

  return (
    <div className="min-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-accent dark:bg-purple-300 p-2 rounded-lg">
            <PackagePlus className="h-6 w-6 text-purple-800 dark:text-purple-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-yellow-600 text-pretty">Create a Digital Twin</h1>
            <p className="text-xs text-gray-500 tracking-wide font-medium ">Mint verifiable NFTs</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="signature">Add Signature</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="metadata" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nftName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Display name for the NFT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nftSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="Short symbol (e.g. WINE)" {...field} />
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
                        <FormLabel>Bundle Type</FormLabel>
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
                        <FormLabel>Quantity (in gallons)</FormLabel>
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
                name="nftDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of the NFT and wine product" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="nftMedia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media</FormLabel>
                      <FormUploadField
                        wallet={wallet}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        // error={!!form.formState.errors.collectionMedia}
                        disabled={form.formState.isSubmitting}
                      />
                      <FormDescription>Link to your collection image or html (Arweave/IPFS)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nftExternalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Link to external website or details page" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Attributes Tab */}
            <TabsContent value="attributes" className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <FormLabel>Additional Attributes</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                    <Plus className="mr-2 h-4 w-4" /> Add Attribute
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left">Trait Type</th>
                        <th className="px-4 py-2 text-left">Value</th>
                        <th className="px-4 py-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {attributes.length > 0 ? (
                        attributes.map((_, index) => (
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
              </div>
            </TabsContent>

            {/* Signature Tab */}
            <TabsContent value="signature" className="space-y-6">
              <div className="space-y-2">
                <FormLabel>Connected Wallet</FormLabel>
                <Input
                  value={wallet.publicKey?.toBase58()}
                  placeholder={wallet.publicKey?.toBase58()}
                  className="text-muted-foreground cursor-not-allowed opacity-40"
                  readOnly
                />

                {/* <FormDescription className="text-xs mb-6">
                  This wallet address will sign and mint the NFT
                </FormDescription> */}
              </div>
              <div className="text-sm border-1 text-accent-foreground dark:text-sidebar-accent !border-green-600 dark:border-accent-background bg-green-100/80 p-4 rounded-md">
                {/* <strong className="flex gap-4 mb-2 tracking-normal">
                  <Coins className="h-5 w-5" />
                  Ensure Sufficient SOL
                </strong> */}

                <div className="mt-0">
                  <p className="text-neutral-800">
                    NFT minting requires gas fee on the blockchain — request an airdrop if needed <a href="#">here</a>
                  </p>
                </div>
              </div>

              <div className="text-sm border-1 text-accent-foreground dark:text-sidebar-accent !border-yellow-600 dark:border-accent-background bg-yellow-100/80 p-4 rounded-md">
                <strong className="flex gap-4 mb-2 tracking-normal">
                  <Info className="h-5 w-5" />
                  By clicking "Sign & Mint", you confirm that:
                </strong>
                <div className="px-4 mt-2">
                  <li className="text-neutral-800">You are the rightful owner of this wine product</li>
                  <li className="text-neutral-800">All information provided is accurate and verifiable</li>
                  <li className="text-neutral-800">
                    You understand this will create an immutable record on the blockchain
                  </li>
                </div>
              </div>

              {/* <div>
                <p className="text-sm text-muted-foreground mb-8">
                  Review your information and sign the transaction to mint your NFT.
                </p>
                <p className="text-sm text-muted-foreground">
                  By clicking "Sign & Mint", you will be prompted to sign the transaction with your connected wallet.
                  NFT minting requires gas fees on the blockchain network.
                </p>
              </div> */}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div>
              {activeTab !== 'metadata' && (
                <Button type="button" variant="outline" onClick={goToPrevTab}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {activeTab !== 'signature' ? (
                <Button type="button" onClick={goToNextTab}>
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
                      <Check className="text-green-600" />
                      Sign & Mint
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>

      <div className="w-full mt-6 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{
            width: activeTab === 'metadata' ? '33%' : activeTab === 'attributes' ? '66%' : '100%',
          }}
        />
      </div>
    </div>
  )
}
