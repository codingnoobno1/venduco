import { NextResponse } from 'next/server'
import { User } from '@/models'
import dbConnect from '@/lib/db'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { vendorId, workerId, action } = body // action: 'ADD' | 'REMOVE'

        if (!vendorId || !workerId) {
            return NextResponse.json({ success: false, message: 'VendorId and WorkerId are required' }, { status: 400 })
        }

        const update = action === 'ADD' 
            ? { $addToSet: { favorites: workerId } } 
            : { $pull: { favorites: workerId } }

        const user = await User.findByIdAndUpdate(vendorId, update, { new: true })

        return NextResponse.json({
            success: true,
            message: `Worker ${action === 'ADD' ? 'added to' : 'removed from'} favorites`,
            data: user.favorites
        })

    } catch (error: any) {
        console.error('Favorite Worker Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
