'use client'
import { CollectionResource, CollectionStatus } from '@/schemas/collection'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, CopyMinus, ExternalLink, MoreHorizontal, MoreHorizontalIcon, Send } from 'lucide-react'
import { getIdenticon } from '@/lib/utils'
import { CollectionStatusBadge } from '../nft-ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { formatDate } from 'date-fns'
import { Button } from '@/components/ui/button'
export const columns: ColumnDef<CollectionResource>[] = [
  {
    id: 'collectionInfo',
    header: 'Collection',
    cell: ({ row }) => {
      const id = row.original._id
      const media = row.original.collectionMedia
      const name = row.original.collectionName
      const symbol = row.original.collectionSymbol
      const status = row.original.status
      return (
        <div className="flex items-center min-w-xs">
          <div className="flex-shrink-0 h-10 w-10">
            <img className="h-10 w-10 rounded-full object-cover" src={media || getIdenticon(id)} alt={name} />
          </div>
          <div className="ml-4">
            <div>
              <div className="text-sm font-medium text-primary text-pretty">{name}</div>
              <div className="text-xs  text-neutral-500 dark:text-neutral-600 font-semibold">{symbol}</div>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'signature',
    header: ({ column }) => 'Signature',
    cell: ({ getValue }) => {
      const value = getValue() as string | null
      return value ? (
        <a
          onClick={(e) => e.stopPropagation()}
          href={`https://explorer.solana.com/tx/${value}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono"
        >
          {value.slice(0, 6)}...{value.slice(-4)}
        </a>
      ) : null
    },
  },
  {
    accessorKey: 'creatorAddress',
    header: ({ column }) => 'Creator',
    cell: ({ getValue }) => (
      <span className="font-mono">
        {(getValue() as string).slice(0, 6)}...{(getValue() as string).slice(-4)}
      </span>
    ),
  },
  {
    accessorKey: 'sellerFeeBasisPoints',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Fee (bps)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => <p className="px-4 text-right w-full font-mono">{getValue() as number}</p>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      return <CollectionStatusBadge status={getValue() as CollectionStatus} />
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const value = getValue()
      const date = (typeof value === 'string' ? new Date(value) : value) as Date
      return formatDate(date.toString(), "dd MMM yy 'at' HH:mm")
    },
  },
  {
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-6">
              <MoreHorizontal size={16} className="text-gray-700 hover:text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="space-y-1">
            <DropdownMenuItem
              disabled={true}
              className="text-gray-900  !cursor-pointer dark:text-gray-50 hover:text-gray-600"
            >
              <ExternalLink className="text-gray-900 dark:text-white" />
              Explorer
            </DropdownMenuItem>
            <div className="!hover:cursor-no-drop">
              <DropdownMenuItem disabled={true} className="text-muted-foreground mb-1">
                <Send className="text-muted-foreground" />
                Transfer
              </DropdownMenuItem>
              <Separator />
              <DropdownMenuItem disabled={true} className="text-muted-foreground">
                <CopyMinus className="text-muted-foreground" />
                Archive
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
