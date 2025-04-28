'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ChevronRight, ChevronLeft, Check, Info, Loader2, Link, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '../ui/separator'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

const formSchema = z.object({
  collectionName: z.string().min(1, 'Collection name is required'),
  collectionSymbol: z.string().min(1, 'Collection symbol is required'),
  collectionDescription: z.string().optional(),
  collectionUri: z.string().optional(),
  creatorAddress: z.string(),
  creatorShare: z.coerce.number().min(0).max(100, 'Share must be between 0 and 100'),
  sellerFee: z.coerce.number().min(0).max(10000, 'Fee must be between 0 and 10000 basis points'),
  maxSupply: z.coerce.number().min(0, 'Max supply must be 0 or greater'),
})
type FormValues = z.infer<typeof formSchema>
type InputMode = 'upload' | 'uri'
interface CollectionUriFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: boolean
  disabled?: boolean
}

export function CollectionUriField({ value, onChange, onBlur, error, disabled }: CollectionUriFieldProps) {
  const [inputMode, setInputMode] = useState<InputMode>('uri')
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleFile(file)
  }

  const handleFile = (file?: File) => {
    if (!file) return

    // Simulate file upload with a delay
    setIsUploading(true)

    // Create a preview
    const fileReader = new FileReader()
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string)
    }
    fileReader.readAsDataURL(file)

    // Simulate upload completion after delay
    setTimeout(() => {
      // In a real implementation, this would be the URI returned from the upload service
      const mockUploadedUri = `https://arweave.net/${Math.random().toString(36).substring(2, 10)}`
      onChange(mockUploadedUri)
      setIsUploading(false)
    }, 1500)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const clearUpload = () => {
    onChange('')
    setPreviewUrl(null)
  }

  return (
    <div className="space-y-3">
      {inputMode === 'uri' ? (
        <Input
          placeholder="https://arweave.net/..."
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          className={cn(error && 'border-destructive')}
          disabled={disabled}
        />
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-md p-6 transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-muted',
            error && 'border-destructive',
            'flex flex-col items-center justify-center gap-2',
            'cursor-pointer',
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : previewUrl ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="relative w-full max-w-[200px] aspect-square">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearUpload()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground truncate max-w-full">
                {value ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    Uploaded successfully
                  </span>
                ) : (
                  'Processing...'
                )}
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag & drop image here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports: JPG, PNG, GIF, SVG</p>
            </>
          )}
        </div>
      )}
      <ToggleGroup
        type="single"
        value={inputMode}
        onValueChange={(value) => {
          if (value) setInputMode(value as InputMode)
        }}
        className="justify-start"
      >
        <ToggleGroupItem value="uri" aria-label="Input URI" disabled={disabled} className="px-8">
          <Link className="h-4 w-4 mr-2" />
          URI
        </ToggleGroupItem>
        <ToggleGroupItem value="upload" aria-label="Upload file" disabled={disabled} className="px-8">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export function CreateCollectionForm() {
  const [activeTab, setActiveTab] = useState('basic')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collectionName: '',
      collectionSymbol: '',
      collectionDescription: '',
      collectionUri: '',
      creatorAddress: '',
      creatorShare: 100,
      sellerFee: 500,
      maxSupply: 0,
    },
  })

  async function onSubmit(data: FormValues) {
    console.log('Form submitted:', JSON.stringify(data))
    await api<FormValues>('collections', {
      method: 'POST',
      body: data,
    })
  }

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

  // Simulate connected wallet for demo purposes
  const connectedWallet = '8ZaDMHBgPVHGPJNGHzjfXXZwDCRQJzP54N8RBcSNBMXQ'

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
                        <CollectionUriField
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
                            placeholder={connectedWallet}
                            {...field}
                            value={field.value || connectedWallet}
                            readOnly
                            className="text-muted-foreground cursor-not-allowed opacity-40"
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
