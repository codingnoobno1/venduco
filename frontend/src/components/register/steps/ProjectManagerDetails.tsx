// Step 3: Role-Specific Details - Project Manager Form
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Briefcase, Building, Calendar, Award, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react"
import { FormInput } from "../shared/FormInput"
import { FormSelect } from "../shared/FormSelect"

interface ProjectManagerDetailsProps {
    data: {
        employmentType: string
        currentOrganization: string
        yearsOfExperience: string
        pastProjects: string
        certifications: string
        declarationAccepted: boolean
    }
    onUpdate: (data: Partial<ProjectManagerDetailsProps["data"]>) => void
    onNext: () => void
    onBack: () => void
}

const employmentOptions = [
    { value: "COMPANY", label: "Company Employed" },
    { value: "CONSULTANT", label: "Independent Consultant" },
    { value: "FREELANCE", label: "Freelance" },
    { value: "GOVT", label: "Government Deputation" },
]

export function ProjectManagerDetails({ data, onUpdate, onNext, onBack }: ProjectManagerDetailsProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!data.employmentType) newErrors.employmentType = "Employment type is required"
        if (!data.currentOrganization?.trim()) newErrors.currentOrganization = "Organization is required"
        if (!data.yearsOfExperience) newErrors.yearsOfExperience = "Experience is required"
        if (!data.declarationAccepted) newErrors.declaration = "You must accept the declaration"

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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Project Manager Details
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Tell us about your professional background
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Professional Info */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                        Professional Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect
                            label="Employment Type"
                            options={employmentOptions}
                            value={data.employmentType}
                            onChange={(e) => onUpdate({ employmentType: e.target.value })}
                            error={errors.employmentType}
                            required
                        />
                        <FormInput
                            label="Current Organization"
                            icon={Building}
                            type="text"
                            placeholder="Company/Org name"
                            value={data.currentOrganization || ""}
                            onChange={(e) => onUpdate({ currentOrganization: e.target.value })}
                            error={errors.currentOrganization}
                            required
                        />
                        <FormInput
                            label="Years of Experience"
                            icon={Calendar}
                            type="number"
                            placeholder="e.g., 10"
                            value={data.yearsOfExperience || ""}
                            onChange={(e) => onUpdate({ yearsOfExperience: e.target.value })}
                            error={errors.yearsOfExperience}
                            required
                        />
                        <FormInput
                            label="Certifications"
                            icon={Award}
                            type="text"
                            placeholder="PMP, PRINCE2, etc."
                            value={data.certifications || ""}
                            onChange={(e) => onUpdate({ certifications: e.target.value })}
                        />
                    </div>
                </div>

                {/* Past Projects */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Past Projects Summary
                    </label>
                    <textarea
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        rows={4}
                        placeholder="Brief description of 3-5 major projects you've managed..."
                        value={data.pastProjects || ""}
                        onChange={(e) => onUpdate({ pastProjects: e.target.value })}
                    />
                </div>

                {/* Declaration */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-orange-800 dark:text-orange-300">
                                Mandatory Declaration
                            </h4>
                            <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                                Project Manager roles require admin approval and legal verification.
                            </p>
                        </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.declarationAccepted || false}
                            onChange={(e) => onUpdate({ declarationAccepted: e.target.checked })}
                            className="mt-1 w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            I understand this role requires admin approval and legal verification.
                            I confirm I have the authority to represent projects on this platform.
                        </span>
                    </label>
                    {errors.declaration && (
                        <p className="mt-2 text-sm text-red-600">{errors.declaration}</p>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-4 pt-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={onBack}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-xl font-semibold"
                    >
                        <ArrowLeft className="w-5 h-5 inline mr-2" />
                        Back
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg"
                    >
                        Continue
                        <ArrowRight className="w-5 h-5 inline ml-2" />
                    </motion.button>
                </div>
            </form>
        </motion.div>
    )
}
