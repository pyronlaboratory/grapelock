'use client'
import { useState } from 'react'
import api from '@/lib/api'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { Loader2, CheckCircleIcon, ScanQrCode, ShieldCheck } from 'lucide-react'
import { NFTTagResource } from '@/schemas/nft'
export function NFTTags({ nftId, tags = [] }: { nftId: string; tags?: NFTTagResource[] }) {
  const [isVerified, setIsVerified] = useState(tags[0]?.status === 'active' || false)
  const [isLoading, setIsLoading] = useState(false)
  const [nextValue, setNextValue] = useState(false)

  const sampleTag: NFTTagResource =
    tags && tags.length > 0
      ? tags[0]
      : {
          nftId,
          _id: 'sample',
          status: 'inactive',
          chipType: 'NTAG215',
          chipId: '04:A2:35:6B:82:1F:80',
          chipManufacturer: 'TCMCZ',
          verificationCount: 1,
          lastVerifiedAt: new Date(),
          activationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

  const handleToggle = async (checked: boolean) => {
    try {
      setIsLoading(true)
      setNextValue(checked)
      const response = await api(`nfts/verify`, {
        method: 'POST',
        body: {
          nftId,
          chipId: sampleTag.chipId,
          chipType: sampleTag.chipType,
          chipMaufacturer: sampleTag.chipManufacturer,
        },
      })

      if (!response) throw new Error('Failed to fulfill order')
      toast.success('Verification successful')
    } catch (error: any) {
      console.error(error)
      toast.error('Failed to fulfill order')
    }

    setTimeout(() => {
      setIsVerified(checked)
      setIsLoading(false)
    }, 1000) // Simulate 1-second loading
  }

  return (
    <Card className="px-6 py-4 rounded-md bg-accent-background gap-0">
      <CardTitle className="text-base">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Verification
          </div>
          <Switch
            checked={isVerified}
            disabled={isVerified || isLoading}
            onCheckedChange={handleToggle}
            aria-label="Toggle verification"
          />
        </div>
      </CardTitle>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">{nextValue ? 'Verifying...' : 'Resetting...'}</p>
          </div>
        ) : isVerified ? (
          <div className="rounded-md p-3 bg-black/50 mt-4">
            <div className="flex flex-row justify-between items-start px-2">
              <p className="text-sm font-semibold mb-1 flex">{sampleTag.chipType} </p>
              <p className="text-xs text-muted-foreground tracking-normal"> {sampleTag.chipManufacturer}</p>
            </div>
            <div className="text-sm font-semibold text-muted-foreground/60 mb-8 px-2 flex">{sampleTag.chipId}</div>
            <div className="flex flex-row gap-2 px-2">
              <CheckCircleIcon className="text-green-400 h-4 w-4" />
              <p className="text-xs tracking-normal text-muted-foreground/80 text-right">
                Last verified on {format(new Date(sampleTag.lastVerifiedAt ?? ''), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-background/50 rounded-lg p-4 flex flex-col items-center text-center gap-3">
            <div className="bg-muted/30 p-3 rounded-full">
              <ScanQrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-xs">
              <p className="text-sm text-muted-foreground mx-auto">
                Scan your NFC card using our mobile dApp to confirm authenticity
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {!isVerified && !isLoading && (
        <p className="text-xs text-muted-foreground/60 mt-16 text-center">
          Don't have the app? Download it{' '}
          <a href="#" className="text-primary underline underline-offset-2">
            here
          </a>{' '}
          or use the switch in top-right corner to simulate verification.
        </p>
      )}
    </Card>
  )
}
