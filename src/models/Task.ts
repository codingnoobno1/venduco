// Task Model - Mongoose Schema
import mongoose, { Schema, Document } from 'mongoose'

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    BLOCKED = 'BLOCKED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface ITask extends Document {
    projectId: string
    title: string
    description?: string
    priority: TaskPriority
    status: TaskStatus
    assignedToId?: string
    machineId?: string
    startDate?: Date
    deadline?: Date
    completedAt?: Date
    completionPercentage: number
    createdById: string
    deletedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
    {
        projectId: {
            type: String,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        priority: {
            type: String,
            enum: Object.values(TaskPriority),
            default: TaskPriority.MEDIUM,
        },
        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.PENDING,
        },
        assignedToId: {
            type: String,
            index: true,
        },
        machineId: {
            type: String,
        },
        startDate: {
            type: Date,
        },
        deadline: {
            type: Date,
            index: true,
        },
        completedAt: {
            type: Date,
        },
        completionPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        createdById: {
            type: String,
            required: true,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

// Compound indexes for efficient querying
TaskSchema.index({ projectId: 1, status: 1 })
TaskSchema.index({ assignedToId: 1, status: 1 })

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
