'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Command } from 'lucide-react'
import { NavUser } from '@/components/navigation/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCluster } from '../cluster/cluster-data-access'
import { links } from '@/lib/links'
import { NavItems } from '../navigation/nav-items'

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { cluster, clusters, setCluster } = useCluster()

  return (
    <Sidebar variant="inset" {...props} className="">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" asChild>
                  <a href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Command className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Grpx</span>
                      <span className="truncate text-xs tracking-wide capitalize">
                        {cluster ? cluster.name : 'Loading...'}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </a>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] z-200" align="start">
                {clusters?.map((item, idx) => (
                  <DropdownMenuItem key={idx} onClick={() => setCluster(item)}>
                    {item?.name} {item === cluster && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems items={links.navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={links.navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
