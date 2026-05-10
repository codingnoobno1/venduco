import { comparePassword, generateToken } from '../labour'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Email and Password are required' }, { status: 400 })
        }

        // Find user by email
        const user = await User.findOne({ email })
        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
        }

        // Verify password
        const isMatch = await comparePassword(password, user.passwordHash)
        if (!isMatch) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
        }

        const token = generateToken(user._id, user.requestedRole || UserRole.LABOUR)

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.requestedRole
            }
        })

    } catch (error: any) {
        console.error('Login Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
