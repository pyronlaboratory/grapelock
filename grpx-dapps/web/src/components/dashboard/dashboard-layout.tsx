'use client'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar } from './dashboard-sidebar'
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function crumbify(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    return {
      name: decodeURIComponent(segment.replace(/-/g, ' ')).replace(/\b\w/g, (l) => l.toUpperCase()),
      href,
      isLast: index === segments.length - 1,
    }
  })
  return crumbs
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const breadcrumbs = crumbify(pathname)
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.name}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {React.Children.map(children, (child, index) => child && <div key={index}>{child}</div>)}
      </SidebarInset>
    </SidebarProvider>
  )
}
