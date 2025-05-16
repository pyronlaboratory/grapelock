export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'
export type JobResult = {
  jobId: string
  status: JobStatus
}

export const stateMap: Record<string, JobStatus> = {
  waiting: 'queued',
  delayed: 'queued',
  active: 'processing',
  completed: 'completed',
  failed: 'failed',
}
