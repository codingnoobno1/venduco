// Step 1: Account Creation Component
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, Phone, User, ArrowRight, Check } from "lucide-react"
import { FormInput } from "../shared/FormInput"

interface Step1Props {
    data: {
        name: string
        email: string
        phone: string
        password: string
        confirmPassword: string
        acceptTerms: boolean
    }
    onUpdate: (data: Partial<Step1Props["data"]>) => void
    onNext: () => void
}

export function Step1AccountCreation({ data, onUpdate, onNext }: Step1Props) {
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!data.name.trim()) newErrors.name = "Full name is required"
        if (!data.email.trim()) newErrors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = "Invalid email format"
        }
        if (!data.phone.trim()) newErrors.phone = "Phone number is required"
        else if (!/^\+?[\d\s-]{10,}$/.test(data.phone)) {
            newErrors.phone = "Invalid phone number"
        }
        if (!data.password) newErrors.password = "Password is required"
        else if (data.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
        }
        if (data.password !== data.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }
        if (!data.acceptTerms) {
            newErrors.acceptTerms = "You must accept the terms"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            onNext()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Create Your Account
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Enter your basic information to get started
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <FormInput
                    label="Full Name"
                    icon={User}
                    type="text"
                    placeholder="Enter your full name"
                    value={data.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    error={errors.name}
                    required
                />

                {/* Email */}
                <FormInput
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="you@example.com"
                    value={data.email}
                    onChange={(e) => onUpdate({ email: e.target.value })}
                    error={errors.email}
                    required
                />

                {/* Phone */}
                <FormInput
                    label="Mobile Number"
                    icon={Phone}
                    type="tel"
                    placeholder="+91-9876543210"
                    value={data.phone}
                    onChange={(e) => onUpdate({ phone: e.target.value })}
                    error={errors.phone}
                    required
                />

                {/* Password */}
                <div className="relative">
                    <FormInput
                        label="Password"
                        icon={Lock}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={data.password}
                        onChange={(e) => onUpdate({ password: e.target.value })}
                        error={errors.password}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-10 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Confirm Password */}
                <FormInput
                    label="Confirm Password"
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={data.confirmPassword}
                    onChange={(e) => onUpdate({ confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    required
                />

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={data.acceptTerms}
                        onChange={(e) => onUpdate({ acceptTerms: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                        I agree to the{" "}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </label>
                </div>
                {errors.acceptTerms && (
                    <p className="text-sm text-red-600">{errors.acceptTerms}</p>
                )}

                {/* Submit Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </form>

            {/* Already have account */}
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 font-semibold hover:underline">
                    Sign in
                </a>
            </p>
        </motion.div>
    )
}
