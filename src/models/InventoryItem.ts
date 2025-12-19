// Inventory Item Model - Mongoose Schema
import mongoose, { Schema, Document } from 'mongoose'

export interface IInventoryItem extends Document {
    projectId: string
    name: string
    sku: string
    category: string
    unit: string
    quantity: number
    minimumStock: number
    reorderPoint: number
    supplier?: string
    unitPrice?: number
    warehouseLocation?: string
    deletedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const InventoryItemSchema = new Schema<IInventoryItem>(
    {
        projectId: {
            type: String,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        unit: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        minimumStock: {
            type: Number,
            default: 0,
            min: 0,
        },
        reorderPoint: {
            type: Number,
            default: 0,
            min: 0,
        },
        supplier: {
            type: String,
            trim: true,
        },
        unitPrice: {
            type: Number,
            min: 0,
        },
        warehouseLocation: {
            type: String,
            trim: true,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
InventoryItemSchema.index({ projectId: 1, quantity: 1 })
InventoryItemSchema.index({ projectId: 1, category: 1 })

export const InventoryItem = mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema)
