export const dynamic = 'force-dynamic';
// API Route: Get inventory items
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { InventoryItem } from '@/models'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')
        const category = searchParams.get('category')
        const lowStock = searchParams.get('lowStock') // boolean param

        // Build query
        const query: any = { deletedAt: null }
        if (projectId) query.projectId = projectId
        if (category) query.category = category
        if (lowStock === 'true') {
            query.$expr = { $lt: ['$quantity', '$reorderPoint'] }
        }

        const items = await InventoryItem.find(query)
            .sort({ name: 1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: items,
            count: items.length,
        })
    } catch (error: any) {
        console.error('Error fetching inventory:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch inventory items',
                message: error.message,
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        const body = await request.json()
        const {
            projectId,
            name,
            sku,
            category,
            unit,
            quantity,
            minimumStock,
            reorderPoint,
            supplier,
            unitPrice,
        } = body

        // Validation
        if (!projectId || !name || !sku || !category || !unit || quantity === undefined) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields',
                },
                { status: 400 }
            )
        }

        const item = await InventoryItem.create({
            projectId,
            name,
            sku,
            category,
            unit,
            quantity,
            minimumStock,
            reorderPoint,
            supplier,
            unitPrice,
        })

        return NextResponse.json(
            {
                success: true,
                data: item,
                message: 'Inventory item created successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error creating inventory item:', error)

        // Handle duplicate SKU error
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'SKU already exists',
                },
                { status: 409 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create inventory item',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
