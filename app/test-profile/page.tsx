'use client'

import { useState } from 'react'

export default function TestProfilePage() {
  const [log, setLog] = useState<string>('')
  const [requestBody, setRequestBody] = useState<any>(null)

  const runTest = async () => {
    setLog('Running...')
    const rnd = Math.floor(Math.random() * 100000)
    const email = `qa.sample.user${rnd}@example.com`
    try {
      const postRes = await fetch('/api/test-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: 'QA',
          middle_name: 'Mid',
          last_name: 'User',
          year_of_leaving: 2010,
          last_class: 10
        })
      })
      const postJson = await postRes.json()

      const getRes = await fetch(`/api/test-profile?email=${encodeURIComponent(email)}`)
      const getJson = await getRes.json()

      setRequestBody({
        email,
        first_name: 'QA',
        middle_name: 'Mid',
        last_name: 'User',
        year_of_leaving: 2010,
        last_class: 10
      })
      setLog(JSON.stringify({ email, postStatus: postRes.status, postJson, getStatus: getRes.status, getJson }, null, 2))
    } catch (e: any) {
      setLog(`Error: ${e?.message || String(e)}`)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">Test Profile API</h1>
      <button onClick={runTest} className="btn-primary">Run test</button>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <h2 className="font-medium mb-2">Request body</h2>
          <pre className="whitespace-pre-wrap break-all text-sm bg-gray-50 p-3 border rounded">{requestBody ? JSON.stringify(requestBody, null, 2) : '—'}</pre>
        </div>
        <div>
          <h2 className="font-medium mb-2">Response</h2>
          <pre className="whitespace-pre-wrap break-all text-sm bg-gray-50 p-3 border rounded">{log}</pre>
        </div>
      </div>
    </div>
  )
}


