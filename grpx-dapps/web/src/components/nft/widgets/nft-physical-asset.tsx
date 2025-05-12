import { Card, CardTitle } from '@/components/ui/card'
import { Wine } from 'lucide-react'

export function NFTPhysicalAsset({ nftDescription }: any) {
  return (
    <Card className="px-6 rounded-md bg-accent-background">
      <CardTitle>
        <div className="flex items-center gap-2">
          <Wine className="h-4 w-4" />
          Asset
        </div>
      </CardTitle>
    </Card>
  )
}
