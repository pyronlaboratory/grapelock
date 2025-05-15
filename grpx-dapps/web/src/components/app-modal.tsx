import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReactNode } from 'react'
import { Separator } from './ui/separator'

export function AppModal({
  children,
  classes,
  override,
  title,
  innerTitle,
  submit,
  submitDisabled,
  submitLabel,
  shineEffect,
  size,
  variant,
  open,
  onOpenChange,
}: {
  children: ReactNode
  title: string | ReactNode
  override?: boolean
  innerTitle?: ReactNode
  submit?: () => void
  submitDisabled?: boolean
  submitLabel?: string | ReactNode
  classes?: string
  shineEffect?: boolean
  size?: 'sm' | 'lg' | 'default' | 'icon' | null | undefined
  variant?: 'outline' | 'default'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={classes}>
          {title}
          {shineEffect && (
            <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform skew-x-[-20deg] shine-effect" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[625px] p-4 pb-0">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold">{override ? innerTitle : title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">{children}</div>
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
