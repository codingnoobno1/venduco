/**
 * cors.ts — CORS helpers for Next.js App Router API routes
 *
 * Usage in any route.ts:
 *
 *   export { OPTIONS } from '@/lib/cors'
 *
 *   export async function POST(req: NextRequest) {
 *     const res = await handler(req)
 *     return withCors(res)
 *   }
 */
import { NextRequest, NextResponse } from 'next/server'

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
  'Access-Control-Max-Age':       '86400',
}

/**
 * Respond to OPTIONS preflight requests.
 * Export this from any route that needs CORS:
 *   export { OPTIONS } from '@/lib/cors'
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * Attach CORS headers to an existing NextResponse.
 * Call this before returning from any POST/GET/PATCH handler:
 *   return withCors(NextResponse.json({ ... }))
 */
export function withCors(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v))
  return response
}

/**
 * Quick helper to build a CORS-wrapped JSON response in one call:
 *   return corsJson({ success: true, data })
 *   return corsJson({ success: false, error: 'Bad request' }, { status: 400 })
 */
export function corsJson(
  body: unknown,
  init?: ResponseInit,
): NextResponse {
  return withCors(NextResponse.json(body, init))
}
