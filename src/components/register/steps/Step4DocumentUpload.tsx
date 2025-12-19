// Step 4: Document Upload
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Upload, ArrowRight, ArrowLeft, Check, AlertCircle } from "lucide-react"
import { FileUploader } from "../shared/FileUploader"

interface Step4Props {
    data: {
        documents: {
            govId?: File
            businessReg?: File
            gstCert?: File
            bankProof?: File
            other?: File
        }
    }
    requestedRole: string
    onUpdate: (documents: Step4Props["data"]["documents"]) => void
    onNext: () => void
    onBack: () => void
}

const getRequiredDocs = (role: string) => {
    const base = [
        { key: "govId", label: "Government ID (Aadhaar/PAN/Passport)", required: true },
    ]

    if (role === "VENDOR") {
        return [
            ...base,
            { key: "businessReg", label: "Business Registration Certificate", required: true },
            { key: "gstCert", label: "GST Certificate", required: false },
            { key: "bankProof", label: "Cancelled Cheque / Bank Proof", required: true },
        ]
    }

    if (role === "PROJECT_MANAGER") {
        return [
            ...base,
            { key: "businessReg", label: "Authorization Letter", required: true },
            { key: "other", label: "Experience Certificate", required: false },
        ]
    }

    if (role === "SUPERVISOR") {
        return [
            ...base,
            { key: "other", label: "Skill Certificate", required: false },
        ]
    }

    return base
}

export function Step4DocumentUpload({ data, requestedRole, onUpdate, onNext, onBack }: Step4Props) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const docs = data.documents || {}
    const requiredDocs = getRequiredDocs(requestedRole)

    const handleFileSelect = (key: string, file: File) => {
        onUpdate({ ...docs, [key]: file })
    }

    const handleFileRemove = (key: string) => {
        const newDocs = { ...docs }
        delete newDocs[key as keyof typeof docs]
        onUpdate(newDocs)
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        requiredDocs.forEach((doc) => {
            if (doc.required && !docs[doc.key as keyof typeof docs]) {
                newErrors[doc.key] = `${doc.label} is required`
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            onNext()
        }
    }

    const uploadedCount = Object.values(docs).filter(Boolean).length
    const requiredCount = requiredDocs.filter(d => d.required).length

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Upload Documents
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Upload required documents for verification
                </p>
            </div>

            {/* Progress */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Documents uploaded
                    </span>
                    <span className="text-sm text-slate-500">
                        {uploadedCount} / {requiredDocs.length}
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-green-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(uploadedCount / requiredDocs.length) * 100}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {requiredDocs.map((doc) => (
                    <div key={doc.key} className="relative">
                        <FileUploader
                            label={`${doc.label}${doc.required ? " *" : " (Optional)"}`}
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            currentFile={docs[doc.key as keyof typeof docs]}
                            onFileSelect={(file) => handleFileSelect(doc.key, file)}
                            onFileRemove={() => handleFileRemove(doc.key)}
                            error={errors[doc.key]}
                        />
                        {docs[doc.key as keyof typeof docs] && (
                            <div className="absolute top-0 right-0">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    <Check className="w-3 h-3" />
                                    Uploaded
                                </span>
                            </div>
                        )}
                    </div>
                ))}

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Important:</strong>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li>Max file size: 5MB per document</li>
                                <li>Accepted formats: PDF, JPG, PNG</li>
                                <li>All documents should be clearly readable</li>
                                <li>Files are encrypted and stored securely</li>
                            </ul>
                        </div>
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
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold shadow-lg"
                    >
                        Submit for Verification
                        <ArrowRight className="w-5 h-5 inline ml-2" />
                    </motion.button>
                </div>
            </form>
        </motion.div>
    )
}
