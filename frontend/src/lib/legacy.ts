/**
 * Bridge for pages written against the old Next.js API routes.
 *
 * Those pages call `fetch('/api/<path>')` and read a `{ success, data, error }` envelope. The Kotlin backend
 * lives under `/api/v1`, authenticates with HttpOnly cookies and mostly returns the payload itself. `legacyFetch`
 * is a drop-in for `fetch` on those pages: it sends the request through `secureFetch` and hands back a Response
 * whose JSON is always in the envelope the page expects.
 *
 * Written when the frontend was put back together: the upgraded versions of these pages were lost, so this is not
 * the original code. A page that is rewritten against `apiRequest` no longer needs it.
 */
import { secureFetch } from '@/lib/api'

/** Old routes whose Kotlin counterpart has a different path. Anything else maps `/api/x` to `/api/v1/x`. */
const RENAMED: Array<{ method: string; from: RegExp; to: string }> = [
  // The user list moved out from under /admin.
  { method: 'GET', from: /^\/api\/admin\/users(?=$|\?)/, to: '/api/users' },
  // The backend does not yet filter projects by assignment; /projects/my is its "projects for the caller".
  { method: 'GET', from: /^\/api\/projects\/assigned(?=$|\?)/, to: '/api/projects/my' },
]

function mapUrl(input: string, method: string): string {
  for (const rule of RENAMED) {
    if (rule.method === method && rule.from.test(input)) return input.replace(rule.from, rule.to)
  }
  return input
}

function isEnvelope(payload: unknown): boolean {
  return typeof payload === 'object' && payload !== null && typeof (payload as { success?: unknown }).success === 'boolean'
}

export async function legacyFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase()
  const response = await secureFetch(mapUrl(input, method), init)

  const contentType = response.headers.get('content-type') || ''
  const hasBody = response.status !== 204 && response.status !== 205
  if (hasBody && !contentType.includes('json')) return response   // files, HTML error pages

  const payload: unknown = hasBody ? await response.json().catch(() => null) : null
  let envelope: unknown
  if (isEnvelope(payload)) {
    envelope = payload
  } else if (response.ok) {
    envelope = { success: true, data: payload }
  } else {
    const problem = (payload || {}) as { message?: string; code?: string }
    envelope = { success: false, error: problem.message || `Request failed with status ${response.status}`, code: problem.code }
  }
  return new Response(JSON.stringify(envelope), {
    // A body cannot accompany 204, and the old pages treat any JSON answer to a successful call as success.
    status: hasBody ? response.status : 200,
    statusText: response.statusText,
    headers: { 'Content-Type': 'application/json' },
  })
}
