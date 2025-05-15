import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { getIdenticon } from '@/lib/utils'

export function NFTMedia({ nftId, nftMedia, nftName }: { nftId: string; nftMedia?: string | null; nftName: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg aspect-square bg-muted/20 border">
      <img src={nftMedia || getIdenticon(nftId)} alt={nftName} className="object-cover w-full h-full" />

      <Button
        variant="ghost"
        size="sm"
        className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm hover:bg-background"
      >
        <Edit className="h-3.5 w-3.5 mr-1" /> Change
      </Button>
    </div>
  )
}
