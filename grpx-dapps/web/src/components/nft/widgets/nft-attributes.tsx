import { Card, CardTitle } from '@/components/ui/card'
import { TableProperties } from 'lucide-react'

export function NFTAttributes({ nftDescription }: any) {
  return (
    <Card className="px-6 rounded-md bg-accent-background">
      <CardTitle>
        <div className="flex items-center gap-2">
          <TableProperties className="h-4 w-4" />
          Attributes
        </div>
      </CardTitle>
    </Card>
  )
}
