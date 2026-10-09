// Reusable Form Input Component
"use client"

import { InputHTMLAttributes } from "react"
import { LucideIcon } from "lucide-react"

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    icon?: LucideIcon
    error?: string
    helperText?: string
}

export function FormInput({
    label,
    icon: Icon,
    error,
    helperText,
    className = "",
    ...props
}: FormInputProps) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {label}
                {props.required && <span className="text-red-600 ml-1">*</span>}
            </label>

            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                )}
                <input
                    className={`
            w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3
            bg-slate-50 dark:bg-slate-900
            border ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'}
            rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            outline-none transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
        </div>
    )
}
