'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const formSchema = z.object({
  collectionName: z.string().min(1, 'Collection name is required'),
  collectionSymbol: z.string().min(1, 'Collection symbol is required'),
  collectionUri: z.string().url('Please enter a valid URL').optional(),
  creatorAddress: z.string().min(32, 'Please enter a valid Solana address'),
  creatorShare: z.coerce.number().min(0).max(100, 'Share must be between 0 and 100'),
  mintAuthority: z.string().min(32, 'Please enter a valid Solana address'),
  sellerFee: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
  maxSupply: z.coerce.number().min(0, 'Max supply must be 0 or greater'),
  tokenDestination: z.string().min(32, 'Please enter a valid Solana address'),
})

type FormValues = z.infer<typeof formSchema>

export function CreateCollectionForm() {
  const [activeTab, setActiveTab] = useState('basic')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionName: '',
      collectionSymbol: '',
      collectionUri: '',
      creatorAddress: '',
      creatorShare: 100,
      mintAuthority: '',
      sellerFee: 500, // 5% default
      maxSupply: 0,
      tokenDestination: '',
    },
  })

  function onSubmit(data: FormValues) {
    console.log('Form submitted:', data)
    // Here you would connect to the blockchain and create the collection
    alert('Collection creation initiated! Check console for details.')
  }

  const nextTab = () => {
    if (activeTab === 'basic') setActiveTab('creator')
    else if (activeTab === 'creator') setActiveTab('minting')
  }

  const prevTab = () => {
    if (activeTab === 'minting') setActiveTab('creator')
    else if (activeTab === 'creator') setActiveTab('basic')
  }

  // Simulate connected wallet for demo purposes
  const connectedWallet = '8ZaDMHBgPVHGPJNGHzjfXXZwDCRQJzP54N8RBcSNBMXQ'

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Collection Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="creator">Creator Details</TabsTrigger>
            <TabsTrigger value="minting">Minting Parameters</TabsTrigger>
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
                    name="collectionUri"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection URI (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://arweave.net/..." {...field} />
                        </FormControl>
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
                          <Input placeholder={connectedWallet} {...field} value={field.value || connectedWallet} />
                        </FormControl>
                        <FormDescription>
                          The wallet address of the creator (defaults to connected wallet)
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
                  <FormField
                    control={form.control}
                    name="mintAuthority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mint Authority</FormLabel>
                        <FormControl>
                          <Input placeholder={connectedWallet} {...field} value={field.value || connectedWallet} />
                        </FormControl>
                        <FormDescription>The wallet that can mint NFTs in this collection</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxSupply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Supply</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="1000" {...field} />
                        </FormControl>
                        <FormDescription>Maximum number of NFTs in this collection (0 for unlimited)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tokenDestination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Destination</FormLabel>
                        <FormControl>
                          <Input placeholder={connectedWallet} {...field} value={field.value || connectedWallet} />
                        </FormControl>
                        <FormDescription>
                          Where minted tokens will be sent (defaults to connected wallet)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <div className="flex justify-between pt-4">
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
                  <Button type="submit" className="ml-auto">
                    Create Collection <Check className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-6">
        <h3 className="text-sm font-medium">Form Progress</h3>
        <div className="w-full mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: activeTab === 'basic' ? '33%' : activeTab === 'creator' ? '66%' : '100%',
            }}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
