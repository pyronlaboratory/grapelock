'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OfferResource, ExtendedOfferResource } from '@/schemas/offer'
import { useGetOffers } from '@/components/marketplace/marketplace-data-access'
import { NFTPurchaseModal } from './forms/nft-purchase-form'
import Loading from '@/app/(dashboard)/loading'
import ErrorScreen from '@/app/(dashboard)/error'
import { ellipsify } from '@wallet-ui/react'
import { getIdenticon } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Keyboard, Search, ChevronUp, ChevronDown } from 'lucide-react'

export function OfferCard({ offer }: { offer: OfferResource }) {
  // alert(JSON.stringify(offer))
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
            <h2 className="text-primary font-medium text-md">
              <span className="text-muted-foreground font-medium text-[10px]">OFFER</span> <br />
              {ellipsify(offer.offer, 8)}
              <br />
              <span className="text-primary/60 font-medium text-[12px]">
                Creator • <span className="text-primary">{ellipsify(offer?.producer || '', 4)}</span>
              </span>{' '}
              <br />
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

export function OfferCardX({ offer }: { offer: ExtendedOfferResource }) {
  const [expanded, setExpanded] = useState(false)

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
            <h2 className="text-primary font-medium text-md">
              <span className="text-muted-foreground font-medium text-[10px]">OFFER</span> <br />
              {ellipsify(offer.offer, 8)}
              <br />
              <span className="text-primary/60 font-medium text-[12px]">
                Creator • <span className="text-primary cursor-pointer !font-sans">{ellipsify(offer.producer, 4)}</span>
              </span>{' '}
              <br />
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
      <CardContent>
        {expanded && (
          <div className="">
            <div className="text-sm text-muted-foreground space-y-2 transition-all px-2 py-8 ">
              <div className="flex sm:flex-row justify-between items-baseline">
                <p className="text-xs font-bold text-muted-foreground/80"> CONTRACT DETAILS</p>
                <div className="flex sm:flex-row capitalize text-sm">Status • {offer.status}</div>
              </div>
              <Separator className="my-0" />
              <br />

              <strong>Escrow </strong>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="my-4">
                  <p>Vault A </p>
                  <p className="border-b-2 border-text-primary w-fit mt-1">
                    <ExplorerLink
                      label={ellipsify(offer.vaultTokenAccountA)}
                      path={`account/${offer.vaultTokenAccountA}`}
                    />
                  </p>
                </div>
                <div className="my-4">
                  <p> Vault B</p>
                  <p className="border-b-2 border-text-primary w-fit mt-1">
                    <ExplorerLink
                      label={ellipsify(offer.vaultTokenAccountB)}
                      path={`account/${offer.vaultTokenAccountB}`}
                    />
                  </p>
                </div>
              </div>

              <strong>Asset</strong>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="my-4">
                  <p className="capitalize"> NFT / {offer.nft?.nftType}</p>
                  <p className="mt-1">
                    {offer?.nft?.nftName} • {offer?.nft?.nftSymbol}
                  </p>

                  <Link
                    href={`/asset-manager/${offer.collectionId}/${offer.nftId}`}
                    className="text-blue-600 border-b-2 border-blue-600 mt-2"
                  >
                    View details
                  </Link>
                </div>
                <div className="my-4">
                  <p>Mint Address</p>
                  <p className="border-b-2 border-text-primary w-fit mt-1">
                    <ExplorerLink label={ellipsify(offer.tokenMintA)} path={`account/${offer.tokenMintA}`} />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="dark:bg-black justify-between items-end mt-4">
        <div>
          <span className="text-muted-foreground/40 text-[12px] px-2 mb-6 flex flex-row gap-3 items-center">
            Last updated: {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex flex-row items-start gap-2">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="lg"
              className="text-xs text-muted-foreground hover:text-primary"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <NFTPurchaseModal selectedOffer={offer} />
        </div>
      </CardFooter>
    </Card>
  )
}

export function OffersList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const { data: offers, isLoading, error } = useGetOffers()
  useEffect(() => {
    if (!offers) return

    let result
    if (searchTerm) {
      // Filter by search term
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
      {isLoading && <Loading />}
      {error && <ErrorScreen />}
      {offers && (
        <>
          {' '}
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
                  <OfferCardX offer={offer} key={offer._id} />
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
        </>
      )}
    </div>
  )
}
