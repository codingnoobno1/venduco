// Step 3: Role-Specific Details - Supervisor Form
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HardHat, Calendar, Wrench, Users, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { FormInput } from "../shared/FormInput"
import { FormSelect } from "../shared/FormSelect"

interface SupervisorDetailsProps {
    data: {
        siteExperience: string
        skillCategories: string[]
        workingUnderType: string
        workingUnderName: string
    }
    onUpdate: (data: Partial<SupervisorDetailsProps["data"]>) => void
    onNext: () => void
    onBack: () => void
}

const skillOptions = [
    { value: "CIVIL", label: "Civil Works" },
    { value: "ELECTRICAL", label: "Electrical" },
    { value: "MECHANICAL", label: "Mechanical" },
    { value: "QUALITY", label: "Quality Control" },
    { value: "SAFETY", label: "Safety Officer" },
    { value: "PLUMBING", label: "Plumbing" },
    { value: "WELDING", label: "Welding" },
]

const workingUnderOptions = [
    { value: "COMPANY", label: "Company" },
    { value: "VENDOR", label: "Vendor" },
    { value: "PROJECT_HEAD", label: "Project Head" },
    { value: "CONTRACTOR", label: "Contractor" },
]

export function SupervisorDetails({ data, onUpdate, onNext, onBack }: SupervisorDetailsProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})

    const toggleSkill = (skill: string) => {
        const current = data.skillCategories || []
        if (current.includes(skill)) {
            onUpdate({ skillCategories: current.filter(s => s !== skill) })
        } else {
            onUpdate({ skillCategories: [...current, skill] })
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!data.siteExperience) newErrors.siteExperience = "Experience is required"
        if (!data.skillCategories?.length) newErrors.skillCategories = "Select at least one skill"
        if (!data.workingUnderType) newErrors.workingUnderType = "This field is required"

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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                    <HardHat className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Supervisor Details
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Tell us about your site experience
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Experience */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        Experience
                    </h3>

                    <FormInput
                        label="Site Experience (Years)"
                        type="number"
                        placeholder="e.g., 5"
                        value={data.siteExperience || ""}
                        onChange={(e) => onUpdate({ siteExperience: e.target.value })}
                        error={errors.siteExperience}
                        required
                    />
                </div>

                {/* Skill Categories */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        <Wrench className="w-4 h-4 inline mr-2" />
                        Skill Categories <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {skillOptions.map((skill) => {
                            const isSelected = data.skillCategories?.includes(skill.value)
                            return (
                                <motion.button
                                    key={skill.value}
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleSkill(skill.value)}
                                    className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2
                    ${isSelected
                                            ? "border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-600"
                                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                        }
                  `}
                                >
                                    {isSelected && <Check className="w-4 h-4" />}
                                    {skill.label}
                                </motion.button>
                            )
                        })}
                    </div>
                    {errors.skillCategories && (
                        <p className="mt-2 text-sm text-red-600">{errors.skillCategories}</p>
                    )}
                </div>

                {/* Working Under */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        Working Under
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect
                            label="Working Under Type"
                            options={workingUnderOptions}
                            value={data.workingUnderType}
                            onChange={(e) => onUpdate({ workingUnderType: e.target.value })}
                            error={errors.workingUnderType}
                            required
                        />
                        <FormInput
                            label="Name (if known)"
                            type="text"
                            placeholder="Company/Person name"
                            value={data.workingUnderName || ""}
                            onChange={(e) => onUpdate({ workingUnderName: e.target.value })}
                        />
                    </div>
                </div>

                {/* Note */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        ⚠️ <strong>Note:</strong> Supervisor roles require manual verification and are never auto-approved.
                    </p>
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
                        className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-xl font-semibold shadow-lg"
                    >
                        Continue
                        <ArrowRight className="w-5 h-5 inline ml-2" />
                    </motion.button>
                </div>
            </form>
        </motion.div>
    )
}
