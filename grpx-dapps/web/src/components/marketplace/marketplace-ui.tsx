'use client'

import { OfferResource } from '@/schemas/offer'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { Keyboard, Search } from 'lucide-react'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { ellipsify } from '@wallet-ui/react'
import { getIdenticon } from '../../lib/utils'
import { NFTPurchaseModal } from './forms/nft-purchase-form'

export function OfferCard({ offer }: { offer: OfferResource }) {
  return (
    <Card
      key={offer._id}
      className="w-full bg-dark dark:bg-black overflow-hidden hover:border-gray-400 transition-all group gap-0 p-0 rounded-3xl border-none cursor-pointer hover:bg-muted/40"
    >
      <CardHeader className="sr-only" />

      <CardContent className="space-y-8 dark:bg-muted/80 dark:hover:bg-blue-600 text-muted-foreground/80 dark:hover:text-white h-[80%]">
        <div className="flex flex-row gap-8 justify-between items-center mb-6 mt-4">
          <div className="flex justify-start gap-4 items-center mt-4">
            <img src={getIdenticon(offer.nftId)} alt={offer.nftId} className="h-12 w-12 rounded-full object-cover" />
            <h2 className="font-medium text-md">
              {ellipsify(offer?.tokenMintA || '', 6)} <br />
              <span className="font-medium text-[12px]">{ellipsify(offer?.offer || '', 4)}</span> <br />
            </h2>
          </div>
          <div className="text-right">
            <div className="flex flex-row items-baseline gap-2">
              <p className="text-xl font-semibold text-green-400">{offer.sellingPrice} </p>
            </div>

            <p className="text-[10px] font-medium text-muted-foreground/80 tracking-wider">SOL</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="dark:bg-black justify-between items-end mt-4">
        <div className="">
          <span className="text-muted-foreground/40 text-[12px] px-2 mb-6 flex flex-row gap-3 items-center">
            Last updated: {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex flex-row items-start gap-2">
          <NFTPurchaseModal selectedOffer={offer} />
        </div>
      </CardFooter>
    </Card>
  )
}

export function OffersList({ offers }: { offers: OfferResource[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!offers) return

    let result

    // Filter by search term
    if (searchTerm) {
      result = [...offers].filter(
        (offer) =>
          offer?.tokenMintA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer._id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
  }, [offers, searchTerm])

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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start md:items-end mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-white"> Marketplace 🔥 </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Discover and trade digital twins</p>
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

      <div className="my-8 flex flex-col-reverse md:flex-row gap-6">
        {offers.length === 0 ? (
          <div className="flex justify-center items-center text-center min-h-11/12 bg-muted-background border rounded-lg w-full h-100">
            <p className="text-foreground/60">
              <b className="text-6xl leading-20 font-medium">¯\_(ツ)_/¯</b>
              <br />
              <br />
              No offers to show!
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 w-full max-w-lg mx-auto 2xl:my-8">
            {offers.map((offer) => (
              <OfferCard offer={offer} key={offer._id} />
            ))}
          </div>
        )}
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
                <img src={getIdenticon(item.nftId)} alt={item.nftId} className="h-8 w-8 rounded object-cover" />
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
