'use client'
import React from 'react'
import { Check, ChevronsUpDown, Command } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useCluster } from './cluster/cluster-data-access'

export default function AppLogo() {
  const { clusters, setCluster, cluster } = useCluster()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg" asChild variant="link" className="shadow-none outline-none !ring-transparent w-[240px]">
          <a href="#" className="!no-underline">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Command className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight ">
              <span className="truncate font-semibold !no-underline">Grpx</span>
              <span className="truncate text-xs tracking-wide capitalize">{cluster?.name}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </a>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] z-200" align="start">
        {clusters?.map((item, idx) => (
          <DropdownMenuItem key={idx} onClick={() => setCluster(item)}>
            {item?.name} {item === cluster && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
