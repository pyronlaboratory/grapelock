import { Package } from 'lucide-react'
import { ellipsify } from '@wallet-ui/react'
export function NFTSolanaInformation({
  nftTokenMintAddress,
  nftTokenAccountAddress,
  nftMetadataAccountAddress,
  nftMasterEditionAccountAddress,
  sellerFeeBasisPoints,
}: {
  nftTokenMintAddress?: string | null
  nftTokenAccountAddress?: string | null
  nftMetadataAccountAddress?: string | null
  nftMasterEditionAccountAddress?: string | null
  sellerFeeBasisPoints: number | null
}) {
  return (
    <div className="border rounded-md">
      <div className="blob-shape p-4 rounded-lg">
        <h3 className="font-medium mb-3 flex items-center text-sm">
          <Package className="h-4 w-4 mr-2 text-xs" /> Blockchain Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token Mint</span>
            <span className="font-medium">{ellipsify(nftTokenMintAddress || '—')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token Account</span>
            <span className="font-medium">{ellipsify(nftTokenAccountAddress || '—')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Metadata Account</span>
            <span className="font-medium capitalize">{ellipsify(nftMetadataAccountAddress || '—')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Master Edition</span>
            <span className="font-medium">{ellipsify(nftMasterEditionAccountAddress || '—')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Sell Fee Basis Points</span>
            <span className="font-medium">{sellerFeeBasisPoints}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
