import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ReactNode } from 'react'

export function AppAlert({ action, children }: { action: ReactNode; children: ReactNode }) {
  return (
    <Alert
      variant="warning"
      className="flex ... bg-amber-100  mt-4 z-99999 fixed left-0 right-0 bottom-20  flex-col sm:flex-row w-fit sm:min-w-2xl mx-4 sm:mx-auto sm:items-center gap-4 "
    >
      <div className="flex items-start justify-center gap-2 ">
        <Info className="h-5 w-5 flex-none  ..." />
        <span className="grow ... overflow-visible mb-1 sm:my-0">{children}</span>
      </div>
      <AlertDescription className="flex justify-end flex-none ... ">{action}</AlertDescription>
    </Alert>
  )
}
