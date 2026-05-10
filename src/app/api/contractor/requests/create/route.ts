import { NextResponse } from 'next/server'
import { ContractorRequest } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { contractorId, type, title, description, quantity, location, budget, requiredBy } = body

        if (!contractorId || !type || !title || !location || !requiredBy) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
        }

        const request = await ContractorRequest.create({
            contractorId,
            type,
            title,
            description,
            quantity,
            location,
            budget,
            requiredBy: new Date(requiredBy),
            status: 'OPEN'
        })

        return NextResponse.json({
            success: true,
            message: 'Contractor request created successfully',
            data: request
        })

    } catch (error: any) {
        console.error('Contractor Request Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
