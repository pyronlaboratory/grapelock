import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-2xl border px-3.5 py-1.5 text-xs font-medium w-fit justify-center whitespace-nowrap shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground border-muted',
        primary: 'bg-green-300 text-green-800 border-green-700',
        secondary: 'bg-secondary text-gray-400 border-secondary',
        destructive: 'bg-red-300 text-red-800 border-red-400',
        processing: 'bg-blue-300 text-blue-800 border-muted',
        registered: 'bg-yellow-200 text-yellow-800 border-yellow-400',
        outline: 'border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
