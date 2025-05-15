'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ErrorScreenProps {
  title?: string
  message?: string
  status?: number | string
  details?: string | Record<string, any>
}

export default function ErrorScreen({
  title = 'Oops.. The gremlins are at it again',
  message = 'An unexpected error occurred',
  status,
  details = '500: Horrible technical reasoning.. ',
}: ErrorScreenProps) {
  return (
    <div className="min-h-[75vh] bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center gap-4">
        <span className="text-7xl font-semibold text-primary">👾</span>
        <h1 className="text-3xl font-semibold text-primary">{status ? `Error ${status}` : title}</h1>
        <p className="text-muted-foreground text-lg">{message}</p>

        <Link
          href="/"
          className="mt-6 flex items-center text-sm gap-2 px-6 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
