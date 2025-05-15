import api, { ApiResponse } from '@/lib/api'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { getSolanaTxExplorerLink } from '@/lib/utils'

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface JobData {
  jobId: string
}
export interface JobState {
  jobId: string
  status: JobStatus
  result?: any
  errorMessage?: string
}

const STORAGE_KEY = 'job-tracker'

export function useJobMonitor() {
  const [jobs, setJobs] = useState<JobState[]>([])
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const shownToasts = useRef<Set<string>>(new Set())
  const { cluster } = useCluster()
  // Load from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      const parsed: JobState[] = JSON.parse(saved)
      setJobs(parsed)
    }
  }, [])

  // // Persist to localStorage
  // useEffect(() => {
  //   localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  // }, [jobs])

  // Polling logic
  useEffect(() => {
    const hasActiveJobs = jobs.some((job) => job.status === 'queued' || job.status === 'processing')
    if (hasActiveJobs && !pollingRef.current) start()
    else if (!hasActiveJobs && pollingRef.current) stop()
  }, [jobs])

  // start / stop polling
  const start = () => {
    if (pollingRef.current) return

    pollingRef.current = setInterval(async () => {
      const updatedJobs = await Promise.all(
        jobs.map(async (job) => {
          if (job.status === 'completed' || job.status === 'failed') return job
          try {
            const res = await api<ApiResponse<JobState>>(`jobs/collection/${job.jobId}`)
            const newStatus: JobStatus = res.data.status
            if (newStatus !== job.status) showToast({ ...job, ...res.data })
            return { ...job, ...res.data }
          } catch (err) {
            return job
          }
        }),
      )
      setJobs(updatedJobs)
    }, 5000)
  }
  const stop = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  // add / remove / update job
  const enqueue = (job: JobState) => {
    setJobs((prev) => [...prev, job])
  }

  const dequeue = (jobId: string) => {
    setJobs((prev) => {
      const updated = prev.filter((job) => job.jobId !== jobId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) // force localStorage sync
      return updated
    })
  }

  const flush = () => {
    setJobs([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const showToast = (job: JobState) => {
    const key = `${job.jobId}-${job.status}`
    if (shownToasts.current.has(key)) return
    shownToasts.current.add(key)

    if (job.status === 'completed') {
      toast.success(`Job ${job.jobId} completed successfully`, {
        action: {
          label: 'View',
          onClick: () =>
            window.open(`${getSolanaTxExplorerLink(job.result.signature, cluster.network ?? 'localnet')}`, '_blank'),
        },
      })
      dequeue(job.jobId)
    } else if (job.status === 'failed') {
      toast.error(`Job failed: ${job.errorMessage || 'Unknown error'}`)
      dequeue(job.jobId)
    } else if (job.status === 'processing') {
      toast(`Job ${job.jobId} is processing..`, { duration: 2000 })
    }
  }

  return {
    jobs,
    enqueue,
    dequeue,
    flush,
  }
}

export function JobMonitorProvider() {
  useJobMonitor()
  return null // No UI, just hooks
}
