// app/marketplace/page.tsx
'use client'
import { useOffers } from '@/components/marketplace/marketplace-data-access'

export default function MarketplacePage() {
  const { data: offers, isLoading, error } = useOffers()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Browse Collections</h1>

      {isLoading && <p>Loading offers...</p>}
      {error && <p className="text-red-500">Failed to load offers.</p>}

      {offers && offers.length > 0 ? (
        <ul className="space-y-4">
          {offers.map((offer: any) => (
            <li key={offer._id} className="p-4 border rounded shadow">
              <p>
                <strong>Mint:</strong> {offer.nftMintAddress}
              </p>
              <p>
                <strong>Price:</strong> {offer.sellingPrice} SOL
              </p>
              <p>
                <strong>Status:</strong> {offer.status}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && <p>No offers found.</p>
      )}
    </div>
  )
}
