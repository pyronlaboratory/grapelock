'use client'

import { OfferResource } from '@/schemas/offer'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import {
  ArrowUpDown,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle,
  CheckCircleIcon,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  Funnel,
  Info,
  Keyboard,
  ListFilter,
  Search,
  ShieldCheck,
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
import { cn, ellipsify, getCollectionIdenticon, getIdenticon } from '../../lib/utils'
import { NFTPurchaseModal } from './forms/nft-purchase-form'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
// export function AssetCard({ asset }: { asset: OfferResource }) {
//   const [expanded, setExpanded] = useState(false)

//   return (
//     <Card
//       className={cn(
//         'w-full max-w-[500px] bg-zinc-900 overflow-hidden transition-all rounded-3xl border-zinc-800 hover:border-zinc-700 cursor-pointer group',
//         expanded ? 'h-auto' : 'h-[170px]',
//       )}
//       onClick={() => setExpanded(!expanded)}
//     >
//       <CardContent className="p-0">
//         {/* Main card content always visible */}
//         <div className="p-4 space-y-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <img
//                 src={getIdenticon(asset.tokenMintA)}
//                 alt={asset.nftId || asset.tokenMintA}
//                 className="h-12 w-12 rounded-full"
//               />
//               <div>
//                 <div className="flex items-center gap-1">
//                   {asset.nftId && <h3 className="font-semibold text-white">{asset.nftId}</h3>}
//                   {/* {asset?.isVerified && (
//                     <TooltipProvider>
//                       <Tooltip>
//                         <TooltipTrigger asChild>
//                           <div>
//                             <BadgeCheck className="h-4 w-4 text-green-500" />
//                           </div>
//                         </TooltipTrigger>
//                         <TooltipContent>
//                           <p>Verified provenance</p>
//                         </TooltipContent>
//                       </Tooltip>
//                     </TooltipProvider>
//                   )} */}
//                 </div>
//                 <p className="text-xs text-zinc-400">{ellipsify(asset.tokenMintA)}</p>
//                 {/* {asset.symbol && <p className="text-xs text-zinc-500">{asset.symbol}</p>} */}
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-xl font-semibold text-green-400">{asset.sellingPrice.toFixed(5)}</p>
//               <p className="text-xs text-zinc-500 uppercase">SOL</p>
//             </div>
//           </div>

//           <div className="flex justify-between items-center">
//             <Badge
//               variant="outline"
//               className={cn(
//                 'px-2 py-0.5 text-xs rounded-full border',
//                 asset.type === 'SINGLE'
//                   ? 'border-blue-700 bg-blue-950/30 text-blue-400'
//                   : 'border-purple-700 bg-purple-950/30 text-purple-400',
//               )}
//             >
//               {asset.type}
//             </Badge>

//             <button
//               className="text-zinc-400 hover:text-white transition-colors"
//               aria-label={expanded ? 'Show less' : 'Show more'}
//             >
//               {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
//             </button>
//           </div>
//         </div>

//         {/* Expandable details section */}
//         {expanded && (
//           <div className="bg-zinc-800/50 p-4 border-t border-zinc-700">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="text-xs text-zinc-500">Producer</p>
//                 <p className="text-sm text-zinc-300">{ellipsify(asset.producerAddress)}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-zinc-500">Offer</p>
//                 <p className="text-sm text-zinc-300">{ellipsify(asset.offerAddress)}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-zinc-500">Escrow</p>
//                 <p className="text-sm text-zinc-300">{ellipsify(asset.escrowAddress)}</p>
//               </div>
//             </div>

//             {asset.description && (
//               <div className="mt-3">
//                 <p className="text-xs text-zinc-500">Description</p>
//                 <p className="text-sm text-zinc-300 mt-1">{asset.description}</p>
//               </div>
//             )}
//           </div>
//         )}
//       </CardContent>

//       <CardFooter className="bg-zinc-950 justify-between p-4">
//         <div>
//           <span className="text-zinc-500 text-xs flex items-center gap-1">
//             <Info className="h-3 w-3" />
//             Updated {formatDistanceToNow(asset.createdAt, { addSuffix: true })}
//           </span>
//         </div>
//         <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium">Purchase</Button>
//       </CardFooter>
//     </Card>
//   )
// }
export function OfferCard({ offer }: { offer: OfferResource }) {
  return (
    // w-[500px] h-[250px]
    <Card
      key={offer._id}
      className="w-full bg-dark dark:bg-black overflow-hidden hover:border-gray-400 transition-all group gap-0 p-0 rounded-3xl border-none cursor-pointer hover:bg-muted/40"
    >
      <CardHeader className="sr-only" />

      <CardContent className="space-y-8 dark:bg-muted/80 dark:hover:bg-blue-600 text-muted-foreground/80 dark:hover:text-white h-[80%]">
        <div className="flex flex-row gap-8 justify-between items-center mb-6 mt-4">
          <div className="flex justify-start gap-4 items-center mt-4">
            <img
              src={getCollectionIdenticon(offer.nftId)}
              alt={offer.nftId}
              className="h-12 w-12 rounded-full object-cover"
            />
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

{
  /* <Separator className="my-4" />
<Button className="h-9.5" size={'sm'} variant={'outline'}>
  Asset
  <ArrowUpRight className="h-4 w-4" />
</Button> */
}
{
  /* <ShieldCheck className="text-green-400 h-4 w-4" />
            Verified Provenance */
}

{
  /*  <div className="flex flex-wrap gap-8 space-y-4 w-max">
          <div className="text-muted-foreground font-mono flex flex-col rounded-md bg-zinc-100 p-4 dark:bg-zinc-800/50 dark:hover:bg-zinc-100 text-xs">
            <span>
              {' '}
              Offer: <b>{ellipsify(offer._id)}</b>{' '}
            </span>
          </div>
          <div className="text-muted-foreground font-mono flex flex-col rounded-md bg-zinc-100 p-4 dark:bg-zinc-800/50 dark:hover:bg-zinc-100 text-xs">
            <span>Producer: {ellipsify(offer.producer || '')}</span>
          </div>
          <div className="text-muted-foreground font-mono flex flex-col rounded-md bg-zinc-100 p-4 dark:bg-zinc-800/50 dark:hover:bg-zinc-100 text-xs">
            <span>Asset: {ellipsify(offer.tokenMintA || '')}</span>
          </div>
          <div className="text-muted-foreground font-mono flex flex-col rounded-md bg-zinc-100 p-4 dark:bg-zinc-800/50 dark:hover:bg-zinc-100 text-xs !h-fit">
            <span>Escrow: {ellipsify(offer.vaultTokenAccountA || '')} </span>
          </div>
        </div> */
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
          <div className="flex justify-center items-center text-center min-h-11/12 bg-muted-background border rounded-lg">
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
