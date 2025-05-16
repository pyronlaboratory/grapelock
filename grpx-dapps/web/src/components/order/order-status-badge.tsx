import { cn } from '@/lib/utils'

export function OrderStatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'awaiting_delivery':
        return 'bg-blue-50 dark:bg-blue-200 text-blue-600 border-blue-200'
      case 'awaiting_confirmation':
        return 'bg-yellow-50 dark:bg-yellow-300 text-yellow-600 border-yellow-200'
      case 'confirmed':
        return 'bg-amber-50 dark:bg-amber-200 text-amber-600 border-amber-200'
      case 'completed':
        return 'bg-green-50 dark:bg-green-200 text-green-600 border-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-4 py-1 rounded-full text-xs font-medium border my-2 ml-auto mr-2',
        getStatusStyles(),
      )}
    >
      {status}
    </span>
  )
}
