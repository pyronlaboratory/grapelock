import { Card, CardTitle } from '@/components/ui/card'
import { Radio } from 'lucide-react'

export function NFTBeacons() {
  return (
    <Card className="px-6 rounded-md bg-accent-background">
      <CardTitle>
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4" />
          Beacons
        </div>
      </CardTitle>
    </Card>
  )
}
