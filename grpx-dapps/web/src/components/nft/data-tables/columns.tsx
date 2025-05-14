'use client'
import { CollectionResource } from '@/schemas/collection'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
export const columns: ColumnDef<CollectionResource>[] = [
  {
    id: 'collectionInfo',
    header: 'Collection',
    cell: ({ row }) => {
      const media = row.original.collectionMedia
      const name = row.original.collectionName
      const symbol = row.original.collectionSymbol

      return (
        <div className="flex items-center gap-3">
          <img src={media || '/placeholder.png'} alt={name} className="w-10 h-10 rounded-full object-cover border" />
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-gray-500">{symbol}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'creatorAddress',
    header: 'Creator Address',
    cell: ({ getValue }) => (
      <span>
        {(getValue() as string).slice(0, 6)}...{(getValue() as string).slice(-4)}
      </span>
    ),
  },
  {
    accessorKey: 'sellerFeeBasisPoints',
    header: 'Fee (bps)',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ getValue }) => {
      const value = getValue()
      const date = typeof value === 'string' ? new Date(value) : value
      return date?.toLocaleString()
    },
  },
  {
    accessorKey: 'signature',
    header: 'Signature',
    cell: ({ getValue }) => {
      const value = getValue() as string | null
      return value ? (
        <a href={`https://explorer.solana.com/tx/${value}`} target="_blank" rel="noopener noreferrer">
          {value.slice(0, 6)}...{value.slice(-4)}
        </a>
      ) : null
    },
  },
]
