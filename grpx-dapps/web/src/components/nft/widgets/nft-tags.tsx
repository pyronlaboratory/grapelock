'use client'
import { useState } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Switch } from '@radix-ui/react-switch'
import { format } from 'date-fns'
import { Check, ScanQrCode, ShieldCheck } from 'lucide-react'

export function NFTTags({ tags }: any) {
  const [isVerified, setIsVerified] = useState(false)

  // Use the first tag if available, or create a sample one
  const sampleTag =
    tags && tags.length > 0
      ? tags[0]
      : {
          _id: 'sample',
          chipId: 'NFC12345',
          manufacturer: 'ChipSecure',
          status: 'active',
          lastVerifiedAt: new Date(),
          verificationCount: 1,
        }
  return (
    <>
      <Card className="px-6 py-4 rounded-md bg-accent-background gap-0">
        <div className="flex items-baseline justify-between mb-2">
          <CardTitle className="text-base">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Verification
            </div>
          </CardTitle>
          <Switch checked={isVerified} onCheckedChange={setIsVerified} aria-label="Toggle verification" />
        </div>

        <CardContent className="p-0">
          {isVerified ? (
            <div className=" rounded-md p-3 bg-black/50 mt-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm font-medium mb-1 flex "># {sampleTag.chipId}</p>
                  <p className="text-xs text-muted-foreground tracking-normal">{sampleTag.manufacturer}</p>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <Check className="text-green-400 h-4 w-4" />
                <p className="text-xs text-muted-foreground/80 text-right ">
                  Last verified on {format(new Date(sampleTag.lastVerifiedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-background/50 rounded-lg p-4 flex flex-col items-center text-center gap-3">
              <div className="bg-muted/30 p-3 rounded-full">
                <ScanQrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2 max-w-xs">
                <p className="text-sm text-muted-foreground  mx-auto">
                  Scan your NFC card using our mobile dApp to confirm authenticity
                </p>
              </div>
            </div>
          )}
        </CardContent>
        {!isVerified && (
          <p className="text-xs text-muted-foreground/60 mt-16 text-center">
            Don't have the app? Download it{' '}
            <a href="#" className="text-primary underline underline-offset-2">
              here
            </a>{' '}
            or use the Toggle switch below to simulate verification.
          </p>
        )}
      </Card>
    </>
  )
}
