import React, { useState } from 'react'
import api from '@/lib/api'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletUi } from '@wallet-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ChevronRight, ChevronLeft, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '../ui/separator'

import { FormUploadField } from '../ui/form-upload'
import { CreateCollectionFormType } from '@/schemas/collection'
import { createCollectionFormSchema } from '../../schemas/collection'

type WineType = any
type SupplyChainStep = any

const mockSupplyChain: SupplyChainStep[] = [
  { stage: 'Harvest', date: '2019-09-15', location: 'Bordeaux, France', verifier: 'Chateau Margaux', complete: true },
  {
    stage: 'Production',
    date: '2019-10-05',
    location: 'Bordeaux, France',
    verifier: 'Chateau Margaux',
    complete: true,
  },
  { stage: 'Bottling', date: '2022-03-18', location: 'Bordeaux, France', verifier: 'Chateau Margaux', complete: true },
  { stage: 'Authentication', date: '2022-03-20', location: 'Bordeaux, France', verifier: 'VinTrust', complete: true },
  {
    stage: 'Export',
    date: '2022-04-10',
    location: 'Bordeaux, France',
    verifier: 'Wine Export Authority',
    complete: true,
  },
  { stage: 'Import', date: '2022-04-25', location: 'New York, USA', verifier: 'US Wine Imports', complete: true },
  {
    stage: 'Distribution',
    date: '2022-05-15',
    location: 'New York, USA',
    verifier: 'Premium Wine Distributors',
    complete: true,
  },
  {
    stage: 'Current Owner',
    date: '2022-06-01',
    location: 'New York, USA',
    verifier: 'Blockchain Verified',
    complete: true,
  },
]
const mockWine: WineType = {
  id: 'cm-2015-0042',
  name: 'Chateau Margaux Grand Vin',
  vintage: 2015,
  region: 'Bordeaux, France',
  vineyard: 'Chateau Margaux',
  varietal: 'Cabernet Sauvignon, Merlot Blend',
  authenticatedDate: '2022-03-20',
  bottleNumber: 42,
  totalBottles: 12000,
  price: 1250,
  imageUrl: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg',
  rarity: 'Rare',
  currentOwner: '8xft7UHPqPCwFm8NtjYxLF9RdmGDs8sUZqzspNQmZA2L',
  transactionCount: 3,
  verificationStatus: 'Verified',
}
export const DefaultContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'chain'>('details')
  const { connected } = useWalletUi()

  return (
    <div className="flex gap-8 flex-col">
      <div className="rounded-md border-1 border-accent p-32">Featured NFT card</div>
      <div className="rounded-md border-1 border-accent p-32">Filterable NFT Gallery with Pagination</div>
    </div>
  )
}
export function CreateCollectionForm() {
  const wallet = useWallet()
  const [activeTab, setActiveTab] = useState('basic')

  const nextTab = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (activeTab === 'basic') setActiveTab('metadata')
    else if (activeTab === 'metadata') setActiveTab('creator')
    else if (activeTab === 'creator') setActiveTab('minting')
  }
  const prevTab = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (activeTab === 'minting') setActiveTab('creator')
    else if (activeTab === 'creator') setActiveTab('metadata')
    else if (activeTab === 'metadata') setActiveTab('basic')
  }
  const form = useForm<CreateCollectionFormType>({
    resolver: zodResolver(createCollectionFormSchema),
    defaultValues: {
      collectionName: '',
      collectionSymbol: '',
      collectionDescription: '',
      collectionUri: '',
      creatorAddress: wallet.publicKey?.toBase58(),
      creatorShare: 100,
      sellerFee: 500,
      maxSupply: 0,
    },
  })
  async function onSubmit(data: CreateCollectionFormType) {
    console.log('Form submitted:', JSON.stringify(data))
    const response = await api<CreateCollectionFormType>('collections', {
      method: 'POST',
      body: data,
    })
    console.log(response)
  }

  return (
    <Card className="w-full md:w-xl">
      <CardHeader>
        <CardTitle>Collection Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 w-auto ">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="creator">Creator</TabsTrigger>
            <TabsTrigger value="minting">Minting</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <TabsContent value="basic">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="collectionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Name</FormLabel>
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
                      <FormItem>
                        <FormLabel>Collection Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="PW23" {...field} />
                        </FormControl>
                        <FormDescription>A short symbol for your collection (like a stock ticker)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collectionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Winter Collection—2025" {...field} />
                        </FormControl>
                        <FormDescription>A short description for your collection</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="metadata">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="collectionUri"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection URI</FormLabel>
                        <FormUploadField
                          wallet={wallet}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={!!form.formState.errors.collectionUri}
                          disabled={form.formState.isSubmitting}
                        />
                        <FormDescription>Link to your collection metadata (JSON on Arweave/IPFS)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="creator">
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
              </TabsContent>

              <TabsContent value="minting">
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground">
                    <strong className="flex gap-4 mb-2 tracking-normal">
                      <Info className="h-5 w-5" />
                      Minting Authority
                    </strong>

                    <p className="text-neutral-650">
                      The wallet used to create the collection controls the minting process and can mint new NFTs. Once
                      minted, NFTs can be transferred or sold, and the minting authority cannot manage them.
                    </p>
                  </div>
                  <Separator />
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
                {activeTab !== 'basic' && (
                  <Button type="button" variant="outline" onClick={prevTab}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                )}

                {activeTab !== 'minting' ? (
                  <Button type="button" className="ml-auto" onClick={nextTab}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit">Create Collection</Button>
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
              width:
                activeTab === 'basic'
                  ? '25%'
                  : activeTab === 'metadata'
                    ? '50%'
                    : activeTab === 'creator'
                      ? '75%'
                      : '100%',
            }}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
