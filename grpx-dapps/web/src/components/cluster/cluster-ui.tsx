'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'

import { useCluster } from './cluster-data-access'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Info } from 'lucide-react'

export function ExplorerLink({
  path,
  label,
  className,
}: {
  path: string
  label: string | React.ReactNode
  className?: string
}) {
  const { getExplorerUrl } = useCluster()
  return (
    <a
      href={getExplorerUrl(path)}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono`}
    >
      {label}
    </a>
  )
}

export function ClusterChecker({ children }: { children: React.ReactNode }) {
  const { cluster } = useCluster()
  const { connection } = useConnection()

  const query = useQuery({
    queryKey: ['version', { cluster, endpoint: connection.rpcEndpoint || 'https://api.testnet.solana.com' }],
    queryFn: () => connection.getVersion(),
    retry: 1,
  })

  const hasShownError = React.useRef(false)
  React.useEffect(() => {
    if (query.isError && !hasShownError.current) {
      toast(
        <div className="flex items-start gap-4">
          <Info className="mt-1 h-5 w-5" />
          <div className="flex flex-row gap-1">
            <div className="text-sm font-medium ">Error connecting to cluster ${cluster.name}</div>
            <div className="text-sm ">
              <Button variant="outline" onClick={() => query.refetch()}>
                Refresh
              </Button>
            </div>
          </div>
        </div>,
        {
          duration: 8000,
          className: 'border',
        },
      )
      hasShownError.current = true
    }

    if (!query.isError) hasShownError.current = false
  }, [query.isError, cluster.name, query.refetch])

  if (query.isLoading) return null
  return children
}

export function ClusterUiSelect() {
  const { clusters, setCluster, cluster } = useCluster()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{cluster?.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {clusters?.map((item) => (
          <DropdownMenuItem key={item.name} onClick={() => setCluster(item)}>
            {item.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
