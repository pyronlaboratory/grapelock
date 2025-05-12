import { NFTType } from '@/schemas/nft'
import { Info } from 'lucide-react'

export function NFTBasicInformation({
  nftSymbol,
  nftType,
  batchSize,
  batchType,
  maxSupply,
  sellerFeeBasisPoints,
}: {
  nftSymbol: string
  nftType: NFTType
  batchSize: number
  batchType: string
  maxSupply: number
  sellerFeeBasisPoints: number
}) {
  return (
    <div className="border rounded-md">
      <div className="blob-shape p-4 rounded-lg">
        <h3 className="font-medium mb-3 flex items-center text-sm">
          <Info className="h-4 w-4 mr-2 text-xs" /> Basic Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Symbol</span>
            <span className="font-medium">{nftSymbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{nftType}</span>
          </div>
          {nftType === 'batch' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch Type:</span>
              <span className="font-medium">{batchType || 'N/A'}</span>
            </div>
          )}
          {nftType === 'batch' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch Size:</span>
              <span className="font-medium">{batchSize || 'N/A'}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Supply:</span>
            <span className="font-medium">{maxSupply}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee Points:</span>
            <span className="font-medium">{sellerFeeBasisPoints}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
