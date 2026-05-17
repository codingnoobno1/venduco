// JWT Verification Utility
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
    userId: string
    email: string
    name?: string
    role?: string
}

export function verifyToken(request: NextRequest): JWTPayload | null {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
    }

    const token = authHeader.substring(7)

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
        return decoded
    } catch (error) {
        return null
    }
}

export function unauthorizedResponse() {
    return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Invalid or expired token' },
        { status: 401 }
    )
}
