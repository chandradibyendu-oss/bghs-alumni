import { NextRequest, NextResponse } from 'next/server'
import { databaseQueue } from '@/lib/queue-service'
import { POST as processJob } from '@/app/api/admin/process-pdf/route'

export async function POST(request: NextRequest) {
  const vercelCron = request.headers.get('x-vercel-cron')
  const secret = request.headers.get('x-cron-key') || request.headers.get('X-CRON-KEY')
  const isAuthorized = Boolean(vercelCron) || (process.env.CRON_SECRET && secret === process.env.CRON_SECRET)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pick next pending job of type pdf_generation
  const nextJob = await databaseQueue.getNextJob('pdf_generation')
  if (!nextJob) {
    return new NextResponse(null, { status: 204 })
  }

  // If an external Lambda URL is configured, offload processing to Lambda to avoid Chromium issues on Vercel
  const lambdaUrl = process.env.PDF_LAMBDA_URL
  const lambdaKey = process.env.PDF_LAMBDA_SECRET
  if (lambdaUrl) {
    try {
      const res = await fetch(lambdaUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(lambdaKey ? { 'x-lambda-key': lambdaKey } : {})
        },
        body: JSON.stringify({ jobId: nextJob.id })
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        return NextResponse.json({ error: 'Lambda processing failed', status: res.status, body: text }, { status: 500 })
      }
      const json = await res.json().catch(() => ({}))
      return NextResponse.json({ success: true, via: 'lambda', data: json })
    } catch (err) {
      return NextResponse.json({ error: 'Lambda request error', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
    }
  }

  // Fallback: reuse the existing processor locally
  const body = JSON.stringify({ jobId: nextJob.id })
  const req = new Request(request.url, { method: 'POST', body, headers: { 'content-type': 'application/json' } })
  return await processJob(req as any)
}

export async function GET(request: NextRequest) {
  // Allow manual trigger via GET (Vercel Run button issues GET)
  const vercelCron = request.headers.get('x-vercel-cron')
  const secret = request.headers.get('x-cron-key') || request.headers.get('X-CRON-KEY')
  const userAgent = request.headers.get('user-agent') || ''
  const isVercelCronUA = userAgent.toLowerCase().includes('vercel-cron')
  const isAuthorized = Boolean(vercelCron) || isVercelCronUA || (process.env.CRON_SECRET && secret === process.env.CRON_SECRET)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const nextJob = await databaseQueue.getNextJob('pdf_generation')
  if (!nextJob) {
    return new NextResponse(null, { status: 204 })
  }

  // Delegate to POST so the same Lambda offload logic applies
  const body = JSON.stringify({ jobId: nextJob.id })
  const req = new Request(request.url, { method: 'POST', body, headers: { 'content-type': 'application/json' } })
  return await POST(req as any)
}


