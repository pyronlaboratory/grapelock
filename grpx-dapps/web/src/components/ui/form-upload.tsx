import { useEffect, useState } from 'react'
import { Check, Loader2, Link, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { cn, uploadToIrys } from '@/lib/utils'
import { useWallet } from '@solana/wallet-adapter-react'

type InputMode = 'upload' | 'uri'

interface FormUploadFieldProps {
  wallet: any
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: boolean
  disabled?: boolean
}

export function FormUploadField({ wallet, value, onChange, onBlur, error, disabled }: FormUploadFieldProps) {
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

  const handleFile = async (file?: File) => {
    if (!file) return

    // Simulate file upload with a delay
    setIsUploading(true)

    // Create a preview
    const fileReader = new FileReader()
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string)
    }
    fileReader.readAsDataURL(file)
    try {
      const uploadedUri = await uploadToIrys(file, wallet)
      onChange(`https://gateway.irys.xyz/${uploadedUri.id}`)
      setIsUploading(false)
    } catch (error) {
      console.error('Error during upload', error)
      setIsUploading(false)
    }
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
