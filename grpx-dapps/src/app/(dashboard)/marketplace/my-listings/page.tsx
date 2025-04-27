// app/marketplace/browse/page.tsx

import { CreateCollectionForm } from '@/components/nft/nft-data-access'

export default function MyListingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">My Listings</h1>
      <div className="max-w-lg absolute mx-auto translate-y-1/2">
        <CreateCollectionForm />
      </div>
    </div>
  )
}
