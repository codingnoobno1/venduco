import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '30d' })
}

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash)
}

export interface LabourResponse {
    success: boolean
    message?: string
    token?: string
    user?: any
}
