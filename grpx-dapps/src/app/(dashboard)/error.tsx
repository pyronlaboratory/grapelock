'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft, ArrowRight, Home } from 'lucide-react'

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
    <div className="min-h-11/12 bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center gap-4">
        <span className="text-7xl font-semibold text-primary">👾</span>
        <h1 className="text-3xl font-semibold text-primary">{status ? `Error ${status}` : title}</h1>
        <p className="text-muted-foreground text-lg">{message}</p>

        {/* {details && (
          <div className="w-full mt-4">
            <div className="bg-accent/50 p-4 rounded-lg overflow-auto max-h-[200px]">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
              </pre>
            </div>
          </div>
        )} */}
        <Link
          href="/"
          className="mt-6 flex items-center gap-2 px-6 py-2 bg-sidebar-primary/50 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
