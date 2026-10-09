// Reusable Form Select Component
"use client"

import { SelectHTMLAttributes } from "react"

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    options: Array<{ value: string; label: string }>
    error?: string
    helperText?: string
}

export function FormSelect({
    label,
    options,
    error,
    helperText,
    className = "",
    ...props
}: FormSelectProps) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {label}
                {props.required && <span className="text-red-600 ml-1">*</span>}
            </label>

            <select
                className={`
          w-full px-4 py-3
          bg-slate-50 dark:bg-slate-900
          border ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'}
          rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          outline-none transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
                {...props}
            >
                <option value="">Select {label}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
        </div>
    )
}
