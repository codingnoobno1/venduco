export const dynamic = 'force-dynamic';
// Health check for Render — also keeps the MongoDB connection warm
import mongoose from 'mongoose'
import dbConnect from '@/lib/db'
import { corsJson, OPTIONS } from '@/lib/cors'

export { OPTIONS }

export async function GET() {
    const start = Date.now()
    try {
        await dbConnect()
        await mongoose.connection.db!.admin().ping()
        return corsJson({ success: true, db: 'up', dbPingMs: Date.now() - start })
    } catch (error: any) {
        return corsJson({ success: false, db: 'down', message: error.message }, { status: 503 })
    }
}
