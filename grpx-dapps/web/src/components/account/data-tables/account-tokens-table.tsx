import React, { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { ellipsify } from '@wallet-ui/react'
import { useGetTokenAccounts } from '@/components/account/account-data-access'
import { useQueryClient } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { Button } from '@/components/ui/button'

export function AccountTokensTable({ address }: { address: PublicKey }) {
  const [showAll, setShowAll] = useState(false)
  const query = useGetTokenAccounts({ address })
  const client = useQueryClient()
  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  return (
    <div className="bg-accent-background dark:border-1 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="px-6 py-4 border-b flex justify-between items-center dark:bg-black">
        <h3 className="text-base font-semibold text-accent-foreground">Token Accounts</h3>
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
              <Button
                variant="outline"
                onClick={async () => {
                  await query.refetch()
                  await client.invalidateQueries({
                    queryKey: ['getTokenAccountBalance'],
                  })
                }}
              >
                <RefreshCw size={16} className="text-green-400" />
              </Button>
            </>
          )}
        </div>
      </div>

      {query.isError && <pre className="alert alert-error">Error: {query.error?.message.toString()}</pre>}
      {query.isSuccess && (
        <div className="">
          {query.data.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No token accounts found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/80">
                  <TableHead className="text-gray-500 px-6 py-2 text-xs font-medium uppercase tracking-wider">
                    Public Key
                  </TableHead>
                  <TableHead className="text-gray-500 px-6 py-2 text-xs font-medium uppercase tracking-wider">
                    Mint
                  </TableHead>
                  <TableHead className="text-gray-500 px-6 py-2 text-right text-xs font-medium uppercase tracking-wider">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map(({ account, pubkey }) => (
                  <TableRow key={pubkey.toString()}>
                    <TableCell className="px-6 py-6">
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink label={ellipsify(pubkey.toString())} path={`account/${pubkey.toString()}`} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(account.data.parsed.info.mint)}
                            path={`account/${account.data.parsed.info.mint.toString()}`}
                          />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <span className="font-mono">{account.data.parsed.info.tokenAmount.uiAmount}</span>
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

export default AccountTokensTable
