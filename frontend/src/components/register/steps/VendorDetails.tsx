// Step 3: Role-Specific Details - Vendor Form
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Building2, Calendar, CreditCard, FileText, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { FormInput } from "../shared/FormInput"
import { FormSelect } from "../shared/FormSelect"

interface VendorDetailsProps {
    data: {
        businessType: string
        businessName: string
        yearsOfOperation: string
        serviceCategories: string[]
        gstNumber: string
        panNumber: string
        bankAccountNumber: string
        ifscCode: string
        bankAccountName: string
    }
    onUpdate: (data: Partial<VendorDetailsProps["data"]>) => void
    onNext: () => void
    onBack: () => void
}

const businessTypeOptions = [
    { value: "INDIVIDUAL", label: "Individual" },
    { value: "PROPRIETORSHIP", label: "Proprietorship" },
    { value: "PARTNERSHIP", label: "Partnership" },
    { value: "PVT_LTD", label: "Private Limited" },
    { value: "LLP", label: "LLP" },
    { value: "PUBLIC", label: "Public Limited" },
]

const serviceCategoryOptions = [
    { value: "MACHINERY", label: "Machinery & Equipment" },
    { value: "LABOUR", label: "Labour & Manpower" },
    { value: "MATERIALS", label: "Construction Materials" },
    { value: "TRANSPORT", label: "Transport & Logistics" },
    { value: "ELECTRICAL", label: "Electrical Works" },
    { value: "CIVIL", label: "Civil Works" },
    { value: "OTHER", label: "Other" },
]

export function VendorDetails({ data, onUpdate, onNext, onBack }: VendorDetailsProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})

    const toggleCategory = (category: string) => {
        const current = data.serviceCategories || []
        if (current.includes(category)) {
            onUpdate({ serviceCategories: current.filter(c => c !== category) })
        } else {
            onUpdate({ serviceCategories: [...current, category] })
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!data.businessType) newErrors.businessType = "Business type is required"
        if (!data.businessName?.trim()) newErrors.businessName = "Business name is required"
        if (!data.serviceCategories?.length) newErrors.serviceCategories = "Select at least one category"
        if (!data.panNumber?.trim()) newErrors.panNumber = "PAN is required"
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)) {
            newErrors.panNumber = "Invalid PAN format"
        }
        if (data.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/.test(data.gstNumber)) {
            newErrors.gstNumber = "Invalid GST format"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Vendor Details
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Tell us about your business
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Info Section */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Business Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect
                            label="Business Type"
                            options={businessTypeOptions}
                            value={data.businessType}
                            onChange={(e) => onUpdate({ businessType: e.target.value })}
                            error={errors.businessType}
                            required
                        />
                        <FormInput
                            label="Business Name"
                            type="text"
                            placeholder="Your company name"
                            value={data.businessName || ""}
                            onChange={(e) => onUpdate({ businessName: e.target.value })}
                            error={errors.businessName}
                            required
                        />
                        <FormInput
                            label="Years of Operation"
                            icon={Calendar}
                            type="number"
                            placeholder="e.g., 5"
                            value={data.yearsOfOperation || ""}
                            onChange={(e) => onUpdate({ yearsOfOperation: e.target.value })}
                        />
                    </div>
                </div>

                {/* Service Categories */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Service Categories <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {serviceCategoryOptions.map((cat) => {
                            const isSelected = data.serviceCategories?.includes(cat.value)
                            return (
                                <motion.button
                                    key={cat.value}
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleCategory(cat.value)}
                                    className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2
                    ${isSelected
                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                        }
                  `}
                                >
                                    {isSelected && <Check className="w-4 h-4" />}
                                    {cat.label}
                                </motion.button>
                            )
                        })}
                    </div>
                    {errors.serviceCategories && (
                        <p className="mt-2 text-sm text-red-600">{errors.serviceCategories}</p>
                    )}
                </div>

                {/* Legal Details Section */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Legal Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="PAN Number"
                            type="text"
                            placeholder="ABCDE1234F"
                            value={data.panNumber || ""}
                            onChange={(e) => onUpdate({ panNumber: e.target.value.toUpperCase() })}
                            error={errors.panNumber}
                            required
                        />
                        <FormInput
                            label="GST Number (Optional)"
                            type="text"
                            placeholder="22ABCDE1234F1Z5"
                            value={data.gstNumber || ""}
                            onChange={(e) => onUpdate({ gstNumber: e.target.value.toUpperCase() })}
                            error={errors.gstNumber}
                            helperText="Leave blank if not applicable"
                        />
                    </div>
                </div>

                {/* Bank Details Section */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Bank Account (for payments)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Account Holder Name"
                            type="text"
                            placeholder="As per bank records"
                            value={data.bankAccountName || ""}
                            onChange={(e) => onUpdate({ bankAccountName: e.target.value })}
                        />
                        <FormInput
                            label="Account Number"
                            type="text"
                            placeholder="Enter account number"
                            value={data.bankAccountNumber || ""}
                            onChange={(e) => onUpdate({ bankAccountNumber: e.target.value })}
                        />
                        <FormInput
                            label="IFSC Code"
                            type="text"
                            placeholder="e.g., SBIN0001234"
                            value={data.ifscCode || ""}
                            onChange={(e) => onUpdate({ ifscCode: e.target.value.toUpperCase() })}
                        />
                    </div>
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
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg"
                    >
                        Continue
                        <ArrowRight className="w-5 h-5 inline ml-2" />
                    </motion.button>
                </div>
            </form>
        </motion.div>
    )
}
