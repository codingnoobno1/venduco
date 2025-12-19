// Dept Selector Component - Quick department multi-select
"use client"

import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface Department {
    name: string
    isSelected: boolean
}

interface DeptSelectorProps {
    departments: Department[]
    onChange: (depts: Department[]) => void
}

const DEPT_ICONS: Record<string, string> = {
    'OHE / Electrical': '⚡',
    'Civil': '🏗️',
    'Signal': '🚦',
    'Telecom': '📡',
    'Buildings': '🏢',
}

export function DeptSelector({ departments, onChange }: DeptSelectorProps) {
    function toggle(name: string) {
        onChange(departments.map(d =>
            d.name === name ? { ...d, isSelected: !d.isSelected } : d
        ))
    }

    return (
        <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
                <motion.button
                    key={dept.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggle(dept.name)}
                    className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors ${dept.isSelected
                            ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                >
                    <span>{DEPT_ICONS[dept.name] || '📦'}</span>
                    <span className="text-sm font-medium">{dept.name}</span>
                    {dept.isSelected ? (
                        <CheckCircle2 size={16} className="text-blue-600" />
                    ) : (
                        <Circle size={16} className="text-slate-400" />
                    )}
                </motion.button>
            ))}
        </div>
    )
}
