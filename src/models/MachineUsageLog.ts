import mongoose, { Schema, Document } from 'mongoose';

export interface IMachineUsageLog extends Document {
    machineAssignmentId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    operatorId?: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    hoursUsed: number;
    fuelConsumed?: number;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MachineUsageLogSchema: Schema = new Schema({
    machineAssignmentId: { type: Schema.Types.ObjectId, ref: 'MachineAssignment', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'EngineeringTask', required: true },
    operatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    hoursUsed: { type: Number, default: 0 },
    fuelConsumed: { type: Number },
    remarks: { type: String }
}, {
    timestamps: true,
});

export const MachineUsageLog = mongoose.models.MachineUsageLog || mongoose.model<IMachineUsageLog>('MachineUsageLog', MachineUsageLogSchema);
