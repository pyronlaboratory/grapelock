// utils/jobs.ts
import { toast } from 'sonner'
import api, { ApiResponse } from '@/lib/api'

type CollectionJobStatus = 'queued' | 'processing' | 'success' | 'failed'

type CollectionJobResult = {
  _id: string
  collectionName: string
  collectionSymbol: string
  collectionDescription: string
  collectionMedia: string
  collectionMetadataUri: string
  creatorAddress: string
  creatorShare: number
  sellerFee: number
  maxSupply: number
  mintAddress: string
  metadataAddress: string
  masterEditionAddress: string
  status: 'completed' | 'failed'
  txSignature: string
  createdAt: string
  updatedAt: string
}

type CollectionJobApiResponse = ApiResponse<{
  status: 'queued' | 'processing' | 'completed' | 'failed'
  result: CollectionJobResult
}>

const JOBS_KEY = 'activeJobIds'

function getActiveJobs(): string[] {
  const stored = localStorage.getItem(JOBS_KEY)
  return stored ? JSON.parse(stored) : []
}

function setActiveJobs(jobs: string[]) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs))
}

function addJob(jobId: string) {
  const jobs = getActiveJobs()
  if (!jobs.includes(jobId)) {
    jobs.push(jobId)
    setActiveJobs(jobs)
  }
}

function removeJob(jobId: string) {
  const jobs = getActiveJobs().filter((id) => id !== jobId)
  setActiveJobs(jobs)
}

export function trackCollectionJob(jobId: string) {
  addJob(jobId)

  let toastId = toast('Job started...', {
    id: `job-${jobId}`,
    description: `Tracking job #${jobId}`,
    duration: 4000,
  })

  const poll = async () => {
    try {
      const res = await api<CollectionJobApiResponse>(`jobs/collection/${jobId}`)
      const { success, data } = res

      if (!success || !data) {
        toast.error('Failed to fetch job status', { id: toastId })
        return
      }

      switch (data.status) {
        case 'queued':
        case 'processing':
          toast.loading(`Job #${jobId} is ${data.status}`, { id: toastId })
          setTimeout(poll, 5000)
          break

        case 'completed':
          toast.success('Collection created!', {
            id: toastId,
            description: `Collection: ${data.result.collectionName}`,
          })
          removeJob(jobId)
          break

        case 'failed':
          toast.error('Collection creation failed.', {
            id: toastId,
          })
          removeJob(jobId)
          break
      }
    } catch (err) {
      toast.error('Error while tracking job', { id: toastId })
      removeJob(jobId)
    }
  }

  poll()
}

export function resumeTrackedJobs() {
  const activeJobs = getActiveJobs()
  activeJobs.forEach(trackCollectionJob)
}
