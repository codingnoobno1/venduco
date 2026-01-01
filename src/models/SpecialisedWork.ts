import mongoose, { Schema, Document } from 'mongoose'

export interface ISpecialisedWork extends Document {
    code: string           // e.g. 'TBM_HARD_ROCK'
    name: string           // e.g. 'TBM Operation in Hard Rock'
    category: 'TUNNEL' | 'METRO' | 'RAIL' | 'ROAD' | 'BRIDGE' | 'ELEC' | 'OTHER'
    requiresCertification: boolean
    description?: string
}

const SpecialisedWorkSchema = new Schema<ISpecialisedWork>(
    {
        code: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ['TUNNEL', 'METRO', 'RAIL', 'ROAD', 'BRIDGE', 'ELEC', 'OTHER'],
            required: true
        },
        requiresCertification: { type: Boolean, default: false },
        description: { type: String },
    },
    { timestamps: true }
)

export const SpecialisedWork = mongoose.models.SpecialisedWork ||
    mongoose.model<ISpecialisedWork>('SpecialisedWork', SpecialisedWorkSchema)
