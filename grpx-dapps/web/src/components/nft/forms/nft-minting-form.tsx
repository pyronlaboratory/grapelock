import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { NFTTypeSelection } from '../nft-ui'
import { CalendarIcon, Loader2, Plus, Shield, Trash2, Upload, Wine } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Define the form schema with Zod
const formSchema = z.object({
  // NFT Information
  nftType: z.enum(['SINGLE', 'BATCH']),
  batchSize: z.number().optional().nullable(),
  batchType: z.string().optional().nullable(),

  // NFT Metadata
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional(),
  externalUrl: z.string().optional(),
  creatorAddress: z.string().min(1, 'Creator address is required'),
  royaltyBasisPoints: z.number().min(0).max(10000),

  // Physical Product
  productType: z.string().min(1, 'Product type is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  manufactureDate: z.date(),

  // Location
  longitude: z.number().optional().nullable(),
  latitude: z.number().optional().nullable(),
  address: z.string().optional(),

  // Dimensions
  length: z.number().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  dimensionUnit: z.string().optional(),

  // Weight
  weight: z.number().optional().nullable(),
  weightUnit: z.string().optional(),

  // Wine Specific
  vintage: z.number().optional().nullable(),
  grapeVariety: z.string().optional(),
  region: z.string().optional(),
  alcoholContent: z.number().optional().nullable(),
  bottleSize: z.string().optional(),
  harvestDate: z.date().optional().nullable(),
  bottlingDate: z.date().optional().nullable(),
  agingDetails: z.string().optional(),

  // Certifications
  isOrganic: z.boolean().optional().default(false),
  isBiodynamic: z.boolean().optional().default(false),
  isSustainable: z.boolean().optional().default(false),

  // Tamper-Proof Chips
  chips: z
    .array(
      z.object({
        chipId: z.string().min(1, 'Chip ID is required'),
        chipType: z.string().min(1, 'Chip type is required'),
        manufacturer: z.string().min(1, 'Manufacturer is required'),
        publicKey: z.string().optional(),
      }),
    )
    .optional()
    .default([]),

  // Sensors
  sensors: z
    .array(
      z.object({
        sensorId: z.string().min(1, 'Sensor ID is required'),
        sensorType: z.string().min(1, 'Sensor type is required'),
        manufacturer: z.string().min(1, 'Manufacturer is required'),
        model: z.string().optional(),
        minThreshold: z.number().optional().nullable(),
        maxThreshold: z.number().optional().nullable(),
        unit: z.string().optional(),
        reportingInterval: z.number().optional().nullable(),
      }),
    )
    .optional()
    .default([]),

  // Additional Attributes
  attributes: z
    .array(
      z.object({
        trait_type: z.string().min(1, 'Trait type is required'),
        value: z.string().min(1, 'Value is required'),
      }),
    )
    .optional()
    .default([]),
})

type FormValues = z.infer<typeof formSchema>

export function NFTMintingForm() {
  const [showTypeSelection, setShowTypeSelection] = useState(true)
  const [activeTab, setActiveTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chipStatus, setChipStatus] = useState('NOT_PAIRED')
  const [sensorStatus, setSensorStatus] = useState('NOT_PAIRED')

  // Initialize the form with default values
  const form = useForm<FormValues>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      nftType: 'SINGLE',
      batchSize: null,
      batchType: null,
      name: '',
      symbol: '',
      description: '',
      image: '',
      externalUrl: '',
      creatorAddress: '',
      royaltyBasisPoints: 500, // 5%
      productType: 'Wine Bottle',
      serialNumber: '',
      manufacturer: '',
      manufactureDate: new Date(),
      longitude: null,
      latitude: null,
      address: '',
      length: null,
      width: null,
      height: null,
      dimensionUnit: 'CM',
      weight: null,
      weightUnit: 'KG',
      vintage: new Date().getFullYear() - 3,
      grapeVariety: '',
      region: '',
      alcoholContent: null,
      bottleSize: 'standard',
      harvestDate: null,
      bottlingDate: null,
      agingDetails: '',
      isOrganic: false,
      isBiodynamic: false,
      isSustainable: false,
      chips: [],
      sensors: [],
      attributes: [],
    },
  })

  // Watch for form value changes
  const nftType = form.watch('nftType')

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Here you would implement the actual submission logic
      console.log('Form data:', data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert('NFT data submitted successfully!')
      // You could reset the form here if needed
      // form.reset()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle NFT type selection
  const handleTypeSelection = (type: 'SINGLE' | 'BATCH') => {
    form.setValue('nftType', type)
    setShowTypeSelection(false)
  }

  // Add a new chip
  const addChip = () => {
    const currentChips = form.getValues('chips') || []
    form.setValue('chips', [...currentChips, { chipId: '', chipType: 'NFC', manufacturer: '', publicKey: '' }])
    setChipStatus('PAIRED')
  }

  // Remove a chip
  const removeChip = (index: number) => {
    const currentChips = form.getValues('chips') || []
    form.setValue(
      'chips',
      currentChips.filter((_, i) => i !== index),
    )
    if (currentChips.length <= 1) {
      setChipStatus('NOT_PAIRED')
    }
  }

  // Add a new sensor
  const addSensor = () => {
    const currentSensors = form.getValues('sensors') || []
    form.setValue('sensors', [
      ...currentSensors,
      {
        sensorId: '',
        sensorType: 'TEMPERATURE',
        manufacturer: '',
        model: '',
        minThreshold: null,
        maxThreshold: null,
        unit: 'CELSIUS',
        reportingInterval: 60,
      },
    ])
    setSensorStatus('PAIRED')
  }

  // Remove a sensor
  const removeSensor = (index: number) => {
    const currentSensors = form.getValues('sensors') || []
    form.setValue(
      'sensors',
      currentSensors.filter((_, i) => i !== index),
    )
    if (currentSensors.length <= 1) {
      setSensorStatus('NOT_PAIRED')
    }
  }

  // Add a new attribute
  const addAttribute = () => {
    const currentAttributes = form.getValues('attributes') || []
    form.setValue('attributes', [...currentAttributes, { trait_type: '', value: '' }])
  }

  // Remove an attribute
  const removeAttribute = (index: number) => {
    const currentAttributes = form.getValues('attributes') || []
    form.setValue(
      'attributes',
      currentAttributes.filter((_, i) => i !== index),
    )
  }

  // If we're showing the type selection screen
  if (showTypeSelection) return <NFTTypeSelection handleTypeSelection={handleTypeSelection} />

  // Main form after type selection
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-950 p-2 rounded-lg">
            <Wine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wine NFT Registration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {nftType === 'SINGLE' ? 'Individual Bottle Registration' : 'Collection Bundle Registration'}
            </p>
          </div>
        </div>
        {/* <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          >
            Preview Mode
          </Badge> */}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-8">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="product">Wine Details</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="metadata">NFT Metadata</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Display name for the NFT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symbol"
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

              {nftType === 'BATCH' && (
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the NFT and wine product"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel htmlFor="imageUpload">Media</FormLabel>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Drag & drop an image or click to browse</p>
                    <p className="text-xs text-gray-400">Recommended: 1000×1000px, Max: 5MB</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Select File
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
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
                      {form.watch('attributes')?.length > 0 ? (
                        form.watch('attributes').map((_, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              <FormField
                                control={form.control}
                                name={`attributes.${index}.trait_type`}
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
                                name={`attributes.${index}.value`}
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
                            No attributes added yet. Click "Add Attribute" to add custom traits.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <FormField
                control={form.control}
                name="externalUrl"
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

            {/* Wine Details Tab */}
            <TabsContent value="product" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wine Product Information</CardTitle>
                  <CardDescription>Details about the physical wine product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wine Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Reserve Cabernet Sauvignon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vintage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vintage Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1900"
                              max="2099"
                              placeholder="YYYY"
                              //   {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Winery/Producer</FormLabel>
                          <FormControl>
                            <Input placeholder="Winery name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bottle Serial Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Unique identifier" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region/Appellation</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Napa Valley, Bordeaux" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="grapeVariety"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Grape Variety</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || 'cab_sauv'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grape variety" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cab_sauv">Cabernet Sauvignon</SelectItem>
                              <SelectItem value="merlot">Merlot</SelectItem>
                              <SelectItem value="pinot_noir">Pinot Noir</SelectItem>
                              <SelectItem value="chard">Chardonnay</SelectItem>
                              <SelectItem value="sauv_blanc">Sauvignon Blanc</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasting Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the wine's aroma, flavor profile, etc."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="alcoholContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alcohol Content (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="e.g. 13.5"
                              //   {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bottleSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bottle Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || 'standard'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select bottle size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="half">Half Bottle (375ml)</SelectItem>
                              <SelectItem value="standard">Standard (750ml)</SelectItem>
                              <SelectItem value="magnum">Magnum (1.5L)</SelectItem>
                              <SelectItem value="double_magnum">Double Magnum (3L)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel>Certifications</FormLabel>
                    <div className="flex items-center space-x-4 mt-2">
                      <FormField
                        control={form.control}
                        name="isOrganic"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="cursor-pointer">Organic</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isBiodynamic"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="cursor-pointer">Biodynamic</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isSustainable"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="cursor-pointer">Sustainable</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Production Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="harvestDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Harvest Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value!} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bottlingDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Bottling Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value!} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="agingDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aging Details</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 18 months in French oak barrels" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Vineyard GPS Location</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Latitude"
                                // {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Longitude"
                                // {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tamper-Proof Chip</CardTitle>
                  <CardDescription>Configure the NFC/RFID chip for product verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full w-3 h-3 ${chipStatus === 'PAIRED' ? 'bg-green-500' : 'bg-amber-500'}`}
                      ></div>
                      <div>
                        <h3 className="font-medium">
                          Chip Status: {chipStatus === 'PAIRED' ? 'Paired' : 'Not Paired'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {chipStatus === 'PAIRED' ? 'Chip ID: TPC-2023-05040XR' : 'No chip paired with this product'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => (chipStatus === 'PAIRED' ? setChipStatus('NOT_PAIRED') : addChip())}
                    >
                      {chipStatus === 'PAIRED' ? 'Unpair' : 'Pair New Chip'}
                    </Button>
                  </div>

                  {chipStatus === 'PAIRED' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.watch('chips')?.map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Tamper-Proof Chip #{index + 1}</h4>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeChip(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`chips.${index}.chipType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Chip Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select chip type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="NFC">NFC</SelectItem>
                                    <SelectItem value="RFID">RFID</SelectItem>
                                    <SelectItem value="BLE">Bluetooth Low Energy</SelectItem>
                                    <SelectItem value="QR">QR Code</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`chips.${index}.chipId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Chip ID</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Unique chip identifier"
                                    {...field}
                                    defaultValue="TPC-2023-05040XR"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`chips.${index}.manufacturer`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Manufacturer</FormLabel>
                                <FormControl>
                                  <Input placeholder="Chip manufacturer" {...field} defaultValue="SecureWine Tech" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`chips.${index}.publicKey`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Public Key</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Chip's public key"
                                    {...field}
                                    defaultValue="0x7f9d8e2b5a3c1d6..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert className="text-sm text-sidebar-accent border-sidebar-primary bg-blue-400/80 p-4 rounded-md">
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Pairing Required</AlertTitle>
                      <AlertDescription>
                        Pair a tamper-proof chip to enable physical verification of your wine product.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>IoT Sensors</CardTitle>
                  <CardDescription>Attach sensors to monitor environmental conditions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full w-3 h-3 ${sensorStatus === 'PAIRED' ? 'bg-green-500' : 'bg-amber-500'}`}
                      ></div>
                      <div>
                        <h3 className="font-medium">
                          Sensor Status: {sensorStatus === 'PAIRED' ? 'Paired' : 'Not Paired'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {sensorStatus === 'PAIRED'
                            ? 'Sensor ID: WS-TEMP-7845'
                            : 'No sensors paired with this product'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => (sensorStatus === 'PAIRED' ? setSensorStatus('NOT_PAIRED') : addSensor())}
                    >
                      {sensorStatus === 'PAIRED' ? 'Unpair' : 'Pair New Sensor'}
                    </Button>
                  </div>

                  {sensorStatus === 'PAIRED' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.watch('sensors')?.map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Sensor #{index + 1}</h4>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSensor(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`sensors.${index}.sensorType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sensor Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select sensor type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="TEMPERATURE">Temperature</SelectItem>
                                    <SelectItem value="HUMIDITY">Humidity</SelectItem>
                                    <SelectItem value="LIGHT">Light/UV</SelectItem>
                                    <SelectItem value="SHOCK">Shock/Vibration</SelectItem>
                                    <SelectItem value="MULTI">Multi-sensor</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`sensors.${index}.sensorId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sensor ID</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Unique sensor identifier"
                                    {...field}
                                    defaultValue="WS-TEMP-7845"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`sensors.${index}.reportingInterval`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reporting Interval (minutes)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="60"
                                    // {...field}
                                    onChange={(e) =>
                                      field.onChange(e.target.value ? Number.parseInt(e.target.value) : null)
                                    }
                                    defaultValue="60"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-2">
                            <FormLabel>Alert Thresholds</FormLabel>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`sensors.${index}.minThreshold`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Min Temp (°C)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="10"
                                        // {...field}
                                        onChange={(e) =>
                                          field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)
                                        }
                                        defaultValue="10"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`sensors.${index}.maxThreshold`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Max Temp (°C)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="18"
                                        // {...field}
                                        onChange={(e) =>
                                          field.onChange(e.target.value ? Number.parseFloat(e.target.value) : null)
                                        }
                                        defaultValue="18"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`sensors.${index}.unit`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Unit</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || 'CELSIUS'}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="CELSIUS">Celsius</SelectItem>
                                        <SelectItem value="FAHRENHEIT">Fahrenheit</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* NFT Metadata Tab */}
            <TabsContent value="metadata" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>NFT Metadata</CardTitle>
                  <CardDescription>Configure how your NFT appears in marketplaces</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6"></CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline">
                Preview
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : (
                  'Mint NFT'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
