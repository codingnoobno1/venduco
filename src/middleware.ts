/**
 * middleware.ts — Global CORS middleware for all /api/* routes
 *
 * Handles:
 *  1. OPTIONS preflight — returns 204 immediately so Dio / fetch / curl can proceed
 *  2. All other methods — passes through and injects CORS headers on the response
 *
 * This covers every current and future API route without touching individual files.
 */
import { NextRequest, NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
  'Access-Control-Max-Age':       '86400',
}

export function middleware(request: NextRequest) {
  // ── OPTIONS preflight ─────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS })
  }

  // ── Pass through + inject headers ────────────────────────────
  const response = NextResponse.next()
  Object.entries(CORS).forEach(([k, v]) => response.headers.set(k, v))
  return response
}

export const config = {
  // Only run on API routes — not on pages, _next/static, images, etc.
  matcher: '/api/:path*',
}
