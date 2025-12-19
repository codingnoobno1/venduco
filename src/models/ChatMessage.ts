// Chat Message Model
import mongoose, { Schema, Document } from 'mongoose'

export interface IChatMessage extends Document {
    projectId: string
    senderId: string
    senderName: string
    senderRole: string
    message: string
    attachments?: string[]
    replyTo?: string
    isRead: boolean
    readBy?: string[]
    timestamp: Date
    createdAt: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        projectId: { type: String, required: true, index: true },
        senderId: { type: String, required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, required: true },
        message: { type: String, required: true },
        attachments: [{ type: String }],
        replyTo: { type: String },
        isRead: { type: Boolean, default: false },
        readBy: [{ type: String }],
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

ChatMessageSchema.index({ projectId: 1, timestamp: -1 })

export const ChatMessage = mongoose.models.ChatMessage ||
    mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)
