'use client'

import { OfferResource } from '@/schemas/offer'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import {
  ArrowUpDown,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  Funnel,
  Keyboard,
  ListFilter,
  Search,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { useWallet } from '@solana/wallet-adapter-react'
import { Badge } from '../ui/badge'
import { NFTResource } from '@/schemas/nft'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { Separator } from '../ui/separator'
import { ellipsify, getCollectionIdenticon } from '../../lib/utils'
import { NFTPurchaseModal } from './forms/nft-purchase-form'

export function OfferCard({ offer }: { offer: OfferResource }) {
  return (
    <Card
      key={offer._id}
      className="bg-muted/20 overflow-hidden hover:border-gray-400 transition-all group gap-0 p-0 min-w-xs rounded-3xl border-none cursor-pointer hover:bg-muted/40"
    >
      <CardHeader className="sr-only" />
      {/* <div className="px-6 py-4 text-primary text-center text-sm font-mono">{ellipsify(offer?.tokenMintA || '')}</div> */}
      <div className="h-12 bg-gradient-to-br from-blue-600 to-blue-900 text-center bottom-0 relative">
        <div
          className={`absolute top-3 right-3 ${offer.status === 'open' ? 'bg-yellow-500' : 'bg-green-500'} dark:bg-black/50 px-4 py-1 rounded-full text-xs font-medium`}
        >
          {offer.status}
        </div>
      </div>
      <CardContent className="space-y-8 dark:bg-black">
        <div className="flex flex-row gap-8 justify-between items-start mb-6 mt-4">
          <div className="flex justify-start gap-4 items-center mt-4">
            <img
              src={getCollectionIdenticon(offer.nftId)}
              alt={offer.nftId}
              className="h-12 w-12 rounded-full object-cover"
            />
            <h2 className="font-medium text-md text-muted-foreground/80">
              {ellipsify(offer?.tokenMintA || '', 6)} <br />
              <span className="font-medium text-[12px]">{ellipsify(offer?.offer || '', 4)}</span> <br />
            </h2>
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="mb-4 text-muted-foreground font-mono flex flex-col rounded-md bg-zinc-100 p-4 dark:bg-zinc-800/50 text-xs min-h-[150px]">
          Details about offer <br />
          Offer and vault details ..
          <br />
          <br />
          <br />
          <br />
          <br />
          ... Token Mint Address
        </div>
        <div className="">
          <div className="flex flex-row items-baseline gap-2">
            <p className="text-xl font-semibold text-green-400">{offer.sellingPrice} </p>
            <p className="text-xs font-medium text-green-400/80 tracking-wider">SOL</p>
          </div>
          <p className="text-[10px] mb-1 text-muted-foreground/80">Price</p>
        </div>

        <NFTPurchaseModal selectedOffer={offer} />
        <Button className="w-full mb-8" variant={'default'}>
          View Details
        </Button>
        <span className="text-muted-foreground/40 text-[12px] px-2 mb-6 flex flex-row gap-3 items-center">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
        </span>
      </CardContent>
    </Card>
  )
}
export function OffersList({ offers }: { offers: OfferResource[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState([0, 100])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filteredOffers, setFilteredOffers] = useState<OfferResource[]>([])
  const [featuredNft, setFeaturedNft] = useState<OfferResource | null>(null)

  useEffect(() => {
    if (!offers) return

    // Set the highest priced NFT as featured
    const highestPriced = [...offers].sort((a, b) => b.sellingPrice - a.sellingPrice)[0]
    setFeaturedNft(highestPriced)

    let result = [...offers].filter((offer) => offer._id !== highestPriced._id)

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (offer) =>
          offer?.tokenMintA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer._id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by price range
    result = result.filter((offer) => offer.sellingPrice >= priceRange[0] && offer.sellingPrice <= priceRange[1])

    // Sort by price
    result.sort((a, b) => {
      return sortOrder === 'asc' ? a.sellingPrice - b.sellingPrice : b.sellingPrice - a.sellingPrice
    })

    setFilteredOffers(result)
  }, [offers, searchTerm, priceRange, sortOrder])

  // Find max price for slider
  const maxPrice = offers ? Math.max(...offers.map((offer) => offer.sellingPrice), 100) : 1000
  const { connected } = useWallet()
  const [open, setOpen] = useState(false)

  // Handle CMD+K to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <div className="">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start md:items-end mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-white"> Marketplace 🔥 </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Discover and trade digital twins</p>

          {/* <div className="flex items-center gap-2 mt-4">
            <Badge variant={connected ? 'default' : 'outline'} className="px-3 py-1 text-xs ">
              <span className={`mr-1.5 h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
              {connected ? 'Wallet Connected' : 'Wallet Disconnected'}
            </Badge>
          </div> */}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="hidden sm:flex items-center gap-2"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-2 text-white" />

      <div className="flex flex-col-reverse md:flex-row gap-6">
        {/* Cards */}
        <div className="flex-3 md:flex-[3] py-4">
          {offers.length === 0 ? (
            <div className="flex justify-center items-center text-center min-h-11/12 bg-muted-background border rounded-lg">
              <p className="text-foreground/60">
                <b className="text-6xl leading-20 font-medium">¯\_(ツ)_/¯</b>
                <br />
                <br />
                No offers to show!
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8">
              {offers.map((offer) => (
                <OfferCard offer={offer} key={offer._id} />
              ))}
            </div>
          )}

          {/* <h2 className="text-xl font-bold mb-6 text-primary/80">Featured </h2>*/}

          {/* Featured NFT Hero Section */}
          {/* {featuredNft && (
            <div className="mb-10 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-purple-900/30 to-zinc-900 rounded-xl flex items-center justify-center">
                    <div className="text-5xl font-bold text-white/20">Featured</div>
                  </div>

                  <div className="w-full md:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                        <span className="text-zinc-400 text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(featuredNft.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured NFT</h2>
                      <p className="text-zinc-400 mb-4">
                        Mint Address: {featuredNft.tokenMintA.substring(0, 8)}...
                        {featuredNft.tokenMintA.substring(featuredNft.tokenMintA.length - 8)}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg">
                          <p className="text-zinc-500 text-xs">Status</p>
                          <p className="font-medium">{featuredNft.status}</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg">
                          <p className="text-zinc-500 text-xs">NFT ID</p>
                          <p className="font-medium">{featuredNft.nftId.substring(0, 10)}...</p>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg">
                          <p className="text-zinc-500 text-xs">Vault</p>
                          <p className="font-medium">{featuredNft.vaultAddress?.substring(0, 10)}...</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <p className="text-zinc-400 text-sm">Price</p>
                        <p className="text-3xl font-bold">{featuredNft.sellingPrice} SOL</p>
                      </div>
                      <Button className="bg-white hover:bg-zinc-200 text-black px-8 py-6 text-lg">Purchase Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}  */}
        </div>

        {/* Filters */}
        <div className="flex-1 lg:flex-[1] mt-4 border rounded-xl px-8 py-6 pb-0 h-fit dark:bg-black">
          <div className="flex flex-col gap-3">
            <p className="uppercase text-xs font-medium flex gap-4 items-center tracking-wider">
              <Funnel className="h-4 w-4" />
              Filters
            </p>
            <span className="text-xs text-muted-foreground mb-6">Showing 12 results</span>
          </div>

          <div className="">
            <div className="flex gap-6 mb-8 w-full">
              <div className="flex flex-col gap-2 w-full">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Sort by Price</h4>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex gap-2 dark:text-green-950 dark:bg-green-400 dark:border-green-600 dark:hover:bg-green-300 !w-full"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === 'asc' ? 'Lowest' : 'Highest'}
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-4 text-muted-foreground/80">Price Range</h4>
              <div className="w-full bg-muted/50 rounded-md p-4 mb-8">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="px-4 mb-2">
                      <Slider
                        defaultValue={[0, maxPrice]}
                        max={maxPrice}
                        step={1}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="my-8"
                      />
                    </div>
                    <div className="flex justify-between text-sm px-4 mb-2">
                      <span className="text-muted-foreground/60 font-semibold">{priceRange[0]} SOL</span>

                      <span className="text-muted-foreground/60 font-semibold">{priceRange[1]} SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search gallery items..." />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-muted-foreground">No results found.</p>
            </div>
          </CommandEmpty>
          <CommandGroup heading="Suggestions">
            {offers.map((item) => (
              <CommandItem key={item.nftId} className="flex items-center gap-2">
                <img
                  src={getCollectionIdenticon(item.nftId)}
                  alt={item.nftId}
                  className="h-8 w-8 rounded object-cover"
                />
                <div>
                  <p>{item.tokenMintA}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.status} · ${item.sellingPrice}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Tips">
            <CommandItem>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>
                Press <kbd className="bg-muted rounded px-1 text-xs">Esc</kbd> to close
              </span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
