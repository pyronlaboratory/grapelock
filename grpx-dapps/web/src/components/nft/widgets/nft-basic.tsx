import { Separator } from '@/components/ui/separator'
import { NFTType } from '@/schemas/nft'
import { Info } from 'lucide-react'

export function NFTBasicInformation({
  nftName,
  nftSymbol,
  nftType,
  batchSize,
  batchType,
}: {
  nftName: string
  nftSymbol: string
  nftType: NFTType
  batchSize: number
  batchType: string
}) {
  return (
    <div className="border rounded-md">
      <div className="blob-shape p-4 rounded-lg">
        <h3 className="font-medium mb-3 flex items-center text-sm">
          <Info className="h-4 w-4 mr-2 text-xs" /> Basic Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{nftName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Symbol</span>
            <span className="font-medium">{nftSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Edition Type</span>
            <span className="font-medium capitalize">{nftType}</span>
          </div>
          {nftType === 'batch' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch Type</span>
              <span className="font-medium">{batchType}</span>
            </div>
          )}
          {nftType === 'batch' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch Size</span>
              <span className="font-medium">{batchSize}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
