import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        // Generic exit / logout API for labour
        return NextResponse.json({
            success: true,
            message: 'Successfully exited / logged out'
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
