import React, { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useGetSignatures } from '@/components/account/account-data-access'
import { PublicKey } from '@solana/web3.js'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { ellipsify } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

export function AccountTransactionsTable({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address })
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-800 bg-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="col-span-2 bg-accent-background dark:border-1 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="px-6 py-4 border-b flex justify-between items-center dark:bg-black">
        <h3 className="text-base font-semibold text-accent-foreground">Transaction History</h3>
        <div className="space-x-2 items-start justify-end flex gap-2">
          {query.isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <>
              {(query.data?.length ?? 0) > 5 && (
                <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Show Less' : 'Show All'}
                </Button>
              )}
              <Button variant="outline" onClick={() => query.refetch()}>
                <RefreshCw size={16} className="text-green-400" />
              </Button>
            </>
          )}
        </div>
      </div>

      {query.isError && <pre className="alert alert-error">Error: {query.error?.message.toString()}</pre>}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No transactions found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/80">
                  <TableHead className="text-gray-500 px-6 py-2 text-xs font-medium uppercase tracking-wider">
                    Signature
                  </TableHead>
                  <TableHead className="text-gray-500 px-6 py-2 text-xs font-medium uppercase tracking-wider text-right">
                    Slot
                  </TableHead>
                  <TableHead className="text-gray-500 px-6 py-2 text-xs font-medium uppercase tracking-wider">
                    Block Time
                  </TableHead>
                  <TableHead className="text-gray-500 px-6 py-2 text-xs font-medium uppercase tracking-wider text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.signature} className="border-none cursor-pointer">
                    <TableHead className="font-mono px-6 py-6">
                      <ExplorerLink path={`tx/${item.signature}`} label={ellipsify(item.signature, 8)} />
                    </TableHead>
                    <TableCell className="font-mono px-6 py-3 text-right">
                      <ExplorerLink path={`block/${item.slot}`} label={item.slot.toString()} />
                    </TableCell>
                    <TableCell className="px-6 py-3">{new Date((item.blockTime ?? 0) * 1000).toISOString()}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-4 py-1 text-xs font-medium rounded-full ${getStatusColor(item.err ? 'failed' : 'success')}`}
                      >
                        {item.err ? 'Failed' : 'Success'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  )
}

export default AccountTransactionsTable
