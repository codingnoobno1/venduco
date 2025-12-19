// File Uploader Component with Drag & Drop
"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Upload, X, FileText, CheckCircle } from "lucide-react"

interface FileUploaderProps {
    label: string
    accept?: string
    maxSize?: number // in MB
    onFileSelect: (file: File) => void
    onFileRemove: () => void
    currentFile?: File | null
    error?: string
}

export function FileUploader({
    label,
    accept = ".pdf,.jpg,.jpeg,.png",
    maxSize = 5,
    onFileSelect,
    onFileRemove,
    currentFile,
    error,
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true)
        } else if (e.type === "dragleave") {
            setIsDragging(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files && files[0]) {
            handleFile(files[0])
        }
    }, [])

    const handleFile = (file: File) => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            alert(`File size must be less than ${maxSize}MB`)
            return
        }
        onFileSelect(file)
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {label}
            </label>

            {!currentFile ? (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
            relative border-2 border-dashed rounded-lg p-8
            ${isDragging
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : error
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                        }
            transition-all duration-200
          `}
                >
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Drop file here or click to browse
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {accept.split(',').join(', ')} (Max {maxSize}MB)
                        </p>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg"
                >
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {currentFile.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {(currentFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onFileRemove}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-red-600" />
                    </button>
                </motion.div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}
