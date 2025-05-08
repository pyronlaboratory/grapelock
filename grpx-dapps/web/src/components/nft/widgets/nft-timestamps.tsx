import { Clock } from 'lucide-react'

export function NFTTimestamps({ createdAt, updatedAt }: { createdAt: string | Date; updatedAt: string | Date }) {
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  return (
    <div className="border rounded-md ">
      <div className="blob-shape p-4 rounded-lg">
        <h3 className="font-medium mb-3 flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2" /> Timestamps
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{formatDate(createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated:</span>
            <span className="font-medium">{formatDate(updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
