import { NextRequest, NextResponse } from 'next/server'
import { databaseQueue } from '@/lib/queue-service'
import { POST as processJob } from '@/app/api/admin/process-pdf/route'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-key') || request.headers.get('X-CRON-KEY')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pick next pending job of type pdf_generation
  const nextJob = await databaseQueue.getNextJob('pdf_generation')
  if (!nextJob) {
    return new NextResponse(null, { status: 204 })
  }

  // Reuse the existing processor by calling the POST handler with the jobId
  const body = JSON.stringify({ jobId: nextJob.id })
  const req = new Request(request.url, { method: 'POST', body, headers: { 'content-type': 'application/json' } })
  return await processJob(req as any)
}

export async function GET(request: NextRequest) {
  // Optional: allow manual trigger via GET with the same secret
  const secret = request.headers.get('x-cron-key') || request.headers.get('X-CRON-KEY')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}


