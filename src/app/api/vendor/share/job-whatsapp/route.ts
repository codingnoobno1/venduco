import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { jobId, phone, type } = body // type: 'WORKER' | 'SUPERVISOR' | 'TEAM'

        // In a real app, this would integrate with a WhatsApp API (e.g. Twilio or Meta)
        // For now, we return the WhatsApp share link
        
        const message = `Hello, check out this job opening on Venduco: https://venduco.com/jobs/${jobId}`
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

        return NextResponse.json({
            success: true,
            whatsappUrl,
            message: 'WhatsApp link generated'
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
