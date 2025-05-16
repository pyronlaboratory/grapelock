import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { NFTResource } from '@/schemas/nft'
import { NFTStatusBadge } from '../nft-ui'

export function NFTBanner({
  nftName,
  nftDescription,
  nftType,
  nftSymbol,
  nftAttributes,
  nftStatus,
}: {
  nftName: string
  nftType: string
  nftSymbol: string
  nftStatus: string
  nftDescription?: string | null
  nftAttributes?: NFTResource['nftAttributes'] | null
}) {
  return (
    <Card className="rounded-md bg-accent-background gap-0">
      <CardHeader className="flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          <h3>{nftName}</h3>
          <p className="text-xs text-muted-foreground font-semibold">
            {nftSymbol || 'GRPX'} • {nftType || 'SINGLE'}
          </p>
        </div>
        <div>
          <NFTStatusBadge status={nftStatus} />
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground/80 space-y-8">
        {nftDescription && (
          <div className="flex flex-col gap-2 mt-8">
            <span className="font-medium mb-1 flex items-center text-sm text-primary">Description</span>
            {nftDescription}
          </div>
        )}

        {nftAttributes?.length ? (
          <div className="flex flex-col gap-2 mt-8">
            <span className="font-medium mb-1 flex items-center text-sm text-primary">Attributes</span>
            <div className="flex flex-wrap gap-4">
              {nftAttributes?.map((attr, index) => (
                <div
                  key={index}
                  className="bg-accent rounded-md p-4 flex space-y-2 flex-col w-max hover:bg-muted/80 flex-grow"
                >
                  <div className="text-xs tracking-normal font-semibold text-muted-foreground/80">
                    {attr.trait_type}
                  </div>
                  <div className="text-sm font-medium text-primary line-clamp-1">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
