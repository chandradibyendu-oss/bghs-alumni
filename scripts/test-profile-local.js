// Simple local test against Next.js endpoints to verify name fields
// Usage: node scripts/test-profile-local.js

const BASE = 'http://127.0.0.1:3000'

async function main() {
  const rnd = Math.floor(Math.random() * 100000)
  const email = `qa.sample.user${rnd}@example.com`
  const body = {
    email,
    first_name: 'QA',
    middle_name: 'Mid',
    last_name: 'User',
    year_of_leaving: 2010,
    last_class: 10
  }

  const postRes = await fetch(`${BASE}/api/test-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const postJson = await postRes.json().catch(() => ({}))

  const getRes = await fetch(`${BASE}/api/test-profile?email=${encodeURIComponent(email)}`)
  const getJson = await getRes.json().catch(() => ({}))

  console.log(JSON.stringify({ email, postStatus: postRes.status, postJson, getStatus: getRes.status, getJson }, null, 2))
}

main().catch((e) => {
  console.error('Test failed', e)
  process.exit(1)
})


