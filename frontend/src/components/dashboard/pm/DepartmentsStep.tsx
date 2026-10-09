// Departments Step - Step 1 of Creation Wizard
"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2,
    Circle,
    Plus,
    Trash2,
    Package,
    Wrench,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import type { Department, WorkPackage } from './ProjectCreationWizard'

interface DepartmentsStepProps {
    departments: Department[]
    onChange: (departments: Department[]) => void
}

const DEPARTMENT_ICONS: Record<string, string> = {
    'OHE / Electrical': '⚡',
    'Civil': '🏗️',
    'Signal': '🚦',
    'Telecom': '📡',
    'Buildings': '🏢',
}

export function DepartmentsStep({ departments, onChange }: DepartmentsStepProps) {
    const [expandedDept, setExpandedDept] = useState<string | null>(null)

    function toggleDepartment(deptName: string) {
        onChange(departments.map(d =>
            d.name === deptName ? { ...d, isSelected: !d.isSelected } : d
        ))
    }

    function toggleExpand(deptName: string) {
        setExpandedDept(expandedDept === deptName ? null : deptName)
    }

    function addWorkPackage(deptName: string) {
        onChange(departments.map(d =>
            d.name === deptName
                ? {
                    ...d,
                    workPackages: [
                        ...d.workPackages,
                        {
                            id: `wp-${Date.now()}`,
                            nature: 'SUPPLIER',
                            scope: '',
                            budget: 0,
                            material: '',
                            quantity: '',
                            deliverables: '',
                        }
                    ]
                }
                : d
        ))
    }

    function updateWorkPackage(deptName: string, wpId: string, updates: Partial<WorkPackage>) {
        onChange(departments.map(d =>
            d.name === deptName
                ? {
                    ...d,
                    workPackages: d.workPackages.map(wp =>
                        wp.id === wpId ? { ...wp, ...updates } : wp
                    )
                }
                : d
        ))
    }

    function removeWorkPackage(deptName: string, wpId: string) {
        onChange(departments.map(d =>
            d.name === deptName
                ? { ...d, workPackages: d.workPackages.filter(wp => wp.id !== wpId) }
                : d
        ))
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    Departments & Work Packages
                </h2>
                <p className="text-slate-500 text-sm">
                    Select departments and define work packages for each
                </p>
            </div>

            <div className="space-y-4">
                {departments.map((dept) => (
                    <motion.div
                        key={dept.name}
                        layout
                        className={`border rounded-xl overflow-hidden transition-colors ${dept.isSelected
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        {/* Department Header */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleDepartment(dept.name)}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${dept.isSelected
                                            ? 'text-blue-600'
                                            : 'text-slate-400'
                                        }`}
                                >
                                    {dept.isSelected ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                </button>
                                <span className="text-2xl">{DEPARTMENT_ICONS[dept.name] || '📦'}</span>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{dept.name}</p>
                                    {dept.workPackages.length > 0 && (
                                        <p className="text-xs text-slate-500">
                                            {dept.workPackages.length} work package(s)
                                        </p>
                                    )}
                                </div>
                            </div>

                            {dept.isSelected && (
                                <button
                                    onClick={() => toggleExpand(dept.name)}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {expandedDept === dept.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            )}
                        </div>

                        {/* Work Packages */}
                        <AnimatePresence>
                            {dept.isSelected && expandedDept === dept.name && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-4 space-y-4">
                                        {dept.workPackages.map((wp, index) => (
                                            <WorkPackageForm
                                                key={wp.id}
                                                workPackage={wp}
                                                index={index}
                                                onChange={(updates) => updateWorkPackage(dept.name, wp.id, updates)}
                                                onRemove={() => removeWorkPackage(dept.name, wp.id)}
                                            />
                                        ))}

                                        <button
                                            onClick={() => addWorkPackage(dept.name)}
                                            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={20} />
                                            Add Work Package
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* Summary */}
            <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>{departments.filter(d => d.isSelected).length}</strong> department(s) selected |
                    <strong> {departments.reduce((acc, d) => acc + d.workPackages.length, 0)}</strong> work package(s) total
                </p>
            </div>
        </div>
    )
}

// Work Package Form Sub-component
function WorkPackageForm({
    workPackage,
    index,
    onChange,
    onRemove
}: {
    workPackage: WorkPackage
    index: number
    onChange: (updates: Partial<WorkPackage>) => void
    onRemove: () => void
}) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white">
                    Work Package #{index + 1}
                </h4>
                <button
                    onClick={onRemove}
                    className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nature */}
                <div>
                    <label className="block text-sm font-medium mb-2">Nature *</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onChange({ nature: 'SUPPLIER' })}
                            className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${workPackage.nature === 'SUPPLIER'
                                    ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Package size={16} className="inline mr-1" />
                            Supplier
                        </button>
                        <button
                            onClick={() => onChange({ nature: 'SUB_CONTRACTOR' })}
                            className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${workPackage.nature === 'SUB_CONTRACTOR'
                                    ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Wrench size={16} className="inline mr-1" />
                            Sub-Contractor
                        </button>
                    </div>
                </div>

                {/* Budget */}
                <div>
                    <label className="block text-sm font-medium mb-2">Budget (₹) *</label>
                    <input
                        type="number"
                        min={0}
                        value={workPackage.budget}
                        onChange={(e) => onChange({ budget: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="500000"
                    />
                </div>

                {/* Scope */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Scope of Work *</label>
                    <textarea
                        rows={2}
                        value={workPackage.scope}
                        onChange={(e) => onChange({ scope: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Describe the scope of work..."
                    />
                </div>

                {/* Supplier-specific fields */}
                {workPackage.nature === 'SUPPLIER' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">Material Description</label>
                            <input
                                type="text"
                                value={workPackage.material || ''}
                                onChange={(e) => onChange({ material: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                placeholder="Steel beams, Cement bags, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <input
                                type="text"
                                value={workPackage.quantity || ''}
                                onChange={(e) => onChange({ quantity: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                placeholder="100 units, 500 kg, etc."
                            />
                        </div>
                    </>
                )}

                {/* Sub-contractor-specific fields */}
                {workPackage.nature === 'SUB_CONTRACTOR' && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Deliverables</label>
                        <textarea
                            rows={2}
                            value={workPackage.deliverables || ''}
                            onChange={(e) => onChange({ deliverables: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="Expected deliverables from the sub-contractor..."
                        />
                    </div>
                )}

                {/* BoQ Upload */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">BoQ Upload (Optional)</label>
                    <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <FileSpreadsheet size={24} className="mx-auto text-slate-400 mb-1" />
                        <p className="text-xs text-slate-500">Upload Excel/CSV</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
