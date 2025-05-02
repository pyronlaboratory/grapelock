import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReactNode } from 'react'

export function AppModal({
  children,
  classes,
  title,
  submit,
  submitDisabled,
  submitLabel,
  shineEffect,
  size,
  variant,
}: {
  children: ReactNode
  title: string | ReactNode
  submit?: () => void
  submitDisabled?: boolean
  submitLabel?: string
  classes?: string
  shineEffect?: boolean
  size?: 'sm' | 'lg' | 'default' | 'icon' | null | undefined
  variant?: 'outline' | 'default'
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={classes}>
          {title}
          {shineEffect && (
            <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform skew-x-[-20deg] shine-effect" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">{children}</div>
        <DialogFooter>
          {submit ? (
            <Button type="submit" onClick={submit} disabled={submitDisabled}>
              {submitLabel || 'Save'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
