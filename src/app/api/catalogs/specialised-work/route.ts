import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { SpecialisedWork } from '@/models/SpecialisedWork'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const works = await SpecialisedWork.find().sort({ category: 1, name: 1 }).lean()

        return NextResponse.json({
            success: true,
            data: works
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
