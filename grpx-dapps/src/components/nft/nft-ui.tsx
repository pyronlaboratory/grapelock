import React, { useState } from 'react'
import { Wine, ArrowRight, Shield, Globe, History } from 'lucide-react'
import { Button } from '../ui/button'
import { useWalletUi } from '@wallet-ui/react'
import { Badge } from '../ui/badge'

type WineType = any
type SupplyChainStep = any

const mockSupplyChain: SupplyChainStep[] = [
  { stage: 'Harvest', date: '2019-09-15', location: 'Bordeaux, France', verifier: 'Chateau Margaux', complete: true },
  {
    stage: 'Production',
    date: '2019-10-05',
    location: 'Bordeaux, France',
    verifier: 'Chateau Margaux',
    complete: true,
  },
  { stage: 'Bottling', date: '2022-03-18', location: 'Bordeaux, France', verifier: 'Chateau Margaux', complete: true },
  { stage: 'Authentication', date: '2022-03-20', location: 'Bordeaux, France', verifier: 'VinTrust', complete: true },
  {
    stage: 'Export',
    date: '2022-04-10',
    location: 'Bordeaux, France',
    verifier: 'Wine Export Authority',
    complete: true,
  },
  { stage: 'Import', date: '2022-04-25', location: 'New York, USA', verifier: 'US Wine Imports', complete: true },
  {
    stage: 'Distribution',
    date: '2022-05-15',
    location: 'New York, USA',
    verifier: 'Premium Wine Distributors',
    complete: true,
  },
  {
    stage: 'Current Owner',
    date: '2022-06-01',
    location: 'New York, USA',
    verifier: 'Blockchain Verified',
    complete: true,
  },
]

const mockWine: WineType = {
  id: 'cm-2015-0042',
  name: 'Chateau Margaux Grand Vin',
  vintage: 2015,
  region: 'Bordeaux, France',
  vineyard: 'Chateau Margaux',
  varietal: 'Cabernet Sauvignon, Merlot Blend',
  authenticatedDate: '2022-03-20',
  bottleNumber: 42,
  totalBottles: 12000,
  price: 1250,
  imageUrl: 'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg',
  rarity: 'Rare',
  currentOwner: '8xft7UHPqPCwFm8NtjYxLF9RdmGDs8sUZqzspNQmZA2L',
  transactionCount: 3,
  verificationStatus: 'Verified',
}

const HeroCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'chain'>('details')
  const { connected } = useWalletUi()

  return (
    <div className="flex gap-8 flex-col">
      <div className="rounded-md border-1 border-accent p-32">Featured NFT card</div>
      <div className="rounded-md border-1 border-accent p-32">Filterable NFT Gallery with Pagination</div>
    </div>
  )
}

export default HeroCard
