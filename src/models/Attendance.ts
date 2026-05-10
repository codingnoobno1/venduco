import mongoose, { Schema, Document } from 'mongoose'

export interface IAttendance extends Document {
    labourId: mongoose.Types.ObjectId
    jobId: mongoose.Types.ObjectId
    checkIn: {
        time: Date
        location: {
            lat: number
            lng: number
            address?: string
        }
    }
    checkOut?: {
        time: Date
        location: {
            lat: number
            lng: number
            address?: string
        }
    }
    status: 'PRESENT' | 'ABSENT' | 'LATE'
    shift: 'DAY' | 'NIGHT'
    createdAt: Date
    updatedAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
    {
        labourId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        jobId: { type: Schema.Types.ObjectId, ref: 'LabourJob', required: true },
        checkIn: {
            time: { type: Date, required: true },
            location: {
                lat: { type: Number },
                lng: { type: Number },
                address: { type: String }
            }
        },
        checkOut: {
            time: { type: Date },
            location: {
                lat: { type: Number },
                lng: { type: Number },
                address: { type: String }
            }
        },
        status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE'], default: 'PRESENT' },
        shift: { type: String, enum: ['DAY', 'NIGHT'], default: 'DAY' }
    },
    { timestamps: true }
)

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema)
