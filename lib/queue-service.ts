import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export interface JobPayload {
  userId: string
  [key: string]: any
}

export interface JobResult {
  success: boolean
  data?: any
  error?: string
}

export class DatabaseQueue {
  private supabase = supabaseAdmin()

  /**
   * Add a new job to the queue
   */
  async addJob(type: string, payload: JobPayload): Promise<string> {
    const { data, error } = await this.supabase
      .from('job_queue')
      .insert({
        type,
        payload,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error adding job to queue:', error)
      throw new Error(`Failed to add job: ${error.message}`)
    }

    return data.id
  }

  /**
   * Get the next pending job of a specific type
   */
  async getNextJob(type: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('job_queue')
      .select('*')
      .eq('type', type)
      .eq('status', 'pending')
      .lt('attempts', 3) // Don't process jobs that have failed 3 times
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error getting next job:', error)
      throw new Error(`Failed to get next job: ${error.message}`)
    }

    return data || null
  }

  /**
   * Mark a job as processing
   */
  async markJobProcessing(jobId: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_queue')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (error) {
      console.error('Error marking job as processing:', error)
      throw new Error(`Failed to mark job as processing: ${error.message}`)
    }
  }

  /**
   * Mark a job as completed with results
   */
  async markJobCompleted(jobId: string, result: JobResult): Promise<void> {
    const { error } = await this.supabase
      .from('job_queue')
      .update({
        status: 'completed',
        result,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (error) {
      console.error('Error marking job as completed:', error)
      throw new Error(`Failed to mark job as completed: ${error.message}`)
    }
  }

  /**
   * Mark a job as failed with error message
   */
  async markJobFailed(jobId: string, errorMessage: string): Promise<void> {
    const { data: job } = await this.supabase
      .from('job_queue')
      .select('attempts, max_attempts')
      .eq('id', jobId)
      .single()

    if (!job) {
      throw new Error('Job not found')
    }

    const newAttempts = job.attempts + 1
    const status = newAttempts >= job.max_attempts ? 'failed' : 'pending'

    const { error } = await this.supabase
      .from('job_queue')
      .update({
        status,
        attempts: newAttempts,
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (error) {
      console.error('Error marking job as failed:', error)
      throw new Error(`Failed to mark job as failed: ${error.message}`)
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<{
    pending: number
    processing: number
    completed: number
    failed: number
  }> {
    const { data, error } = await this.supabase
      .from('job_queue')
      .select('status')

    if (error) {
      console.error('Error getting job stats:', error)
      throw new Error(`Failed to get job stats: ${error.message}`)
    }

    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    }

    data.forEach(job => {
      stats[job.status as keyof typeof stats]++
    })

    return stats
  }

  /**
   * Clean up old completed jobs (optional - for maintenance)
   */
  async cleanupOldJobs(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { error } = await this.supabase
      .from('job_queue')
      .delete()
      .eq('status', 'completed')
      .lt('processed_at', cutoffDate.toISOString())

    if (error) {
      console.error('Error cleaning up old jobs:', error)
      throw new Error(`Failed to cleanup old jobs: ${error.message}`)
    }
  }
}

export const databaseQueue = new DatabaseQueue()
