import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-full place-items-center bg-accent-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-accent-foreground">404</p>
        <h1 className="mt-4 text-5xl font-medium tracking-tight text-balance text-accent-foreground sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-primary sm:text-md/4">
          Looks like you found a spot we're still building.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </Link>
          <Link href="/support" className="text-sm font-semibold text-accent-foreground">
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
