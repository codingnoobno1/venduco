// Step 2: Profile Setup & Role Selection
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Building2, User, HardHat, Truck, Briefcase, ArrowRight, ArrowLeft, MapPin, Globe } from "lucide-react"
import { FormInput } from "../shared/FormInput"
import { FormSelect } from "../shared/FormSelect"

interface Step2Props {
    data: {
        profilePhoto?: File
        city: string
        state: string
        preferredLanguage: string
        requestedRole: string
        operatingRegions: string[]
    }
    onUpdate: (data: Partial<Step2Props["data"]>) => void
    onNext: () => void
    onBack: () => void
}

const roleOptions = [
    { value: "VENDOR", label: "Vendor / Supplier", icon: Truck, description: "Material or service provider" },
    { value: "PROJECT_MANAGER", label: "Project Manager", icon: Briefcase, description: "Project oversight & coordination" },
    { value: "SUPERVISOR", label: "Supervisor", icon: HardHat, description: "On-site supervision" },
    { value: "COMPANY_REP", label: "Company Representative", icon: Building2, description: "Corporate account" },
]

const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "mr", label: "Marathi" },
    { value: "gu", label: "Gujarati" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
]

const stateOptions = [
    { value: "MH", label: "Maharashtra" },
    { value: "GJ", label: "Gujarat" },
    { value: "DL", label: "Delhi" },
    { value: "KA", label: "Karnataka" },
    { value: "TN", label: "Tamil Nadu" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "RJ", label: "Rajasthan" },
    { value: "WB", label: "West Bengal" },
]

export function Step2ProfileSetup({ data, onUpdate, onNext, onBack }: Step2Props) {
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!data.city.trim()) newErrors.city = "City is required"
        if (!data.state) newErrors.state = "State is required"
        if (!data.requestedRole) newErrors.requestedRole = "Please select a role"

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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Setup Your Profile
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Tell us about yourself and how you'll use VendorConnect
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        I am registering as <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {roleOptions.map((role) => {
                            const Icon = role.icon
                            const isSelected = data.requestedRole === role.value
                            return (
                                <motion.button
                                    key={role.value}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onUpdate({ requestedRole: role.value })}
                                    className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${isSelected
                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                                        }
                  `}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={`font-medium ${isSelected ? "text-blue-600" : "text-slate-900 dark:text-white"}`}>
                                                {role.label}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {role.description}
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            )
                        })}
                    </div>
                    {errors.requestedRole && (
                        <p className="mt-2 text-sm text-red-600">{errors.requestedRole}</p>
                    )}
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                        label="City"
                        icon={MapPin}
                        type="text"
                        placeholder="Enter your city"
                        value={data.city}
                        onChange={(e) => onUpdate({ city: e.target.value })}
                        error={errors.city}
                        required
                    />
                    <FormSelect
                        label="State"
                        options={stateOptions}
                        value={data.state}
                        onChange={(e) => onUpdate({ state: e.target.value })}
                        error={errors.state}
                        required
                    />
                </div>

                {/* Language */}
                <FormSelect
                    label="Preferred Language"
                    options={languageOptions}
                    value={data.preferredLanguage}
                    onChange={(e) => onUpdate({ preferredLanguage: e.target.value })}
                />

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={onBack}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </form>
        </motion.div>
    )
}
