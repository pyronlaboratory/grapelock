'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, getCollectionIdenticon } from '@/lib/utils'
import { CollectionResource } from '@/schemas/collection'
import { CollectionStatusBadge, CreateCollectionModal } from '../nft-ui'
import { ChevronDown, FunnelIcon, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}
interface CollectionTableProps {
  collections: CollectionResource[]
}

export function CollectionTable({ collections }: CollectionTableProps) {
  const router = useRouter()
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-accent my-8">
      <table className="min-w-full divide-y divide-accent">
        <thead className="bg-primary-foreground">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Collection
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>

            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            ></th>
          </tr>
        </thead>
        <tbody className="bg-accent-background divide-y divide-accent">
          {collections.map((collection) => (
            <tr
              key={collection._id}
              className="hover:bg-primary-foreground transition duration-150 ease-in-out cursor-pointer"
              onClick={() => router.push(`/asset-manager/${collection._id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={collection.collectionMedia || getCollectionIdenticon(collection._id)}
                      alt={collection.collectionName}
                    />
                  </div>
                  <div className="ml-4">
                    <div>
                      <div className="text-sm font-medium text-neutral-400 text-pretty">
                        {collection.collectionName}
                      </div>
                      <div className="text-sm text-neutral-600 font-semibold">{collection.collectionSymbol}</div>
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-neutral-400">
                <CollectionStatusBadge status={collection.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-neutral-400 text-sm text-pretty">
                {formatDate(collection.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 transition">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  // const table = useReactTable({
  //   data,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  // })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })
  return (
    <div className="w-full space-y-1 mt-4">
      <div className="flex items-center py-4 flex-col-reverse gap-4 md:flex-row">
        <Input
          placeholder="Search collection, nfts..."
          value={(table.getColumn('creatorAddress')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('creatorAddress')?.setFilterValue(event.target.value)}
          className="w-full md:max-w-sm "
        />

        <div className="flex flex-col-reverse sm:flex-row-reverse gap-4 md:flex-row justify-between w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="md:ml-auto">
                <FunnelIcon /> Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateCollectionModal classes="bg-accent text-neutral-400 hover:bg-primary-foreground hover:text-primary px-6 h-[36px] rounded-lg  bg-blue-600 dark:bg-sidebar-primary text-primary-foreground dark:text-primary hover:bg-black hover:text-accent-background dark:hover:bg-sidebar-primary/90 dark:hover:text-primary" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
