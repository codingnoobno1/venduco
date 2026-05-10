"use client"

import React from 'react'
import { FileUp, FileText } from 'lucide-react'

interface TenderUploaderProps {
    onUpload: () => void
}

export function TenderUploader({ onUpload }: TenderUploaderProps) {
    return (
        <div
            onClick={onUpload}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer group"
        >
            <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileUp className="w-10 h-10 text-blue-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Upload Tender Document
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        Drag and drop your PDF tender here or click to browse. AI will analyze the requirements instantly.
                    </p>
                </div>
                <div className="mt-4 flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">sampletendor.pdf</span>
                    <span className="text-xs text-blue-600 font-bold ml-4">READY TO ANALYZE</span>
                </div>
            </div>
        </div>
    )
}
