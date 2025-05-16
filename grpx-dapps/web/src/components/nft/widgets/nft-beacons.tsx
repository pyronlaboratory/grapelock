import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Plus, Radio } from 'lucide-react'

export function NFTBeacons() {
  return (
    <Card className="px-6 rounded-md bg-accent-background">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4" />
          Beacons
        </div>
      </CardTitle>
      <CardDescription className="text-sm text-muted-foreground/80 ">
        Add your beacons to connect devices and verify your asset’s journey.
      </CardDescription>
    </Card>
  )
}
