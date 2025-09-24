import { NextRequest, NextResponse } from 'next/server'
import { databaseQueue } from '@/lib/queue-service'

export async function GET(request: NextRequest) {
  try {
    // Get all jobs in the queue
    const { data: allJobs, error: allJobsError } = await databaseQueue['supabase']
      .from('job_queue')
      .select('*')
      .order('created_at', { ascending: false })

    if (allJobsError) {
      return NextResponse.json({ error: allJobsError.message }, { status: 500 })
    }

    // Try to get next job
    const nextJob = await databaseQueue.getNextJob('pdf_generation')

    // Get job stats
    const stats = await databaseQueue.getJobStats()

    return NextResponse.json({
      allJobs,
      nextJob,
      stats,
      message: 'Queue debug info'
    })

  } catch (error) {
    console.error('Debug queue error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
