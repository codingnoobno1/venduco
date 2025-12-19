// Work Package Card Component - Display work package summary
"use client"

import { Package, Wrench, DollarSign, FileText } from 'lucide-react'

interface WorkPackage {
    id: string
    nature: 'SUPPLIER' | 'SUB_CONTRACTOR'
    scope: string
    budget: number
    material?: string
    quantity?: string
    deliverables?: string
}

interface WorkPackageCardProps {
    workPackage: WorkPackage
    departmentName?: string
    onClick?: () => void
}

export function WorkPackageCard({ workPackage, departmentName, onClick }: WorkPackageCardProps) {
    const isSupplier = workPackage.nature === 'SUPPLIER'

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSupplier
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        }`}>
                        {isSupplier ? <Package size={18} /> : <Wrench size={18} />}
                    </div>
                    <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isSupplier
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                            {isSupplier ? 'Supplier' : 'Sub-Contractor'}
                        </span>
                        {departmentName && (
                            <p className="text-xs text-slate-500 mt-1">{departmentName}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <DollarSign size={14} />
                    <span>₹{workPackage.budget.toLocaleString()}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <FileText size={14} className="text-slate-400 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                        {workPackage.scope || 'No scope defined'}
                    </p>
                </div>

                {isSupplier && workPackage.material && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 text-xs">
                        <span className="text-slate-500">Material:</span>{' '}
                        <span className="text-slate-700 dark:text-slate-300">{workPackage.material}</span>
                        {workPackage.quantity && (
                            <span className="text-slate-500"> | Qty: {workPackage.quantity}</span>
                        )}
                    </div>
                )}

                {!isSupplier && workPackage.deliverables && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 text-xs">
                        <span className="text-slate-500">Deliverables:</span>{' '}
                        <span className="text-slate-700 dark:text-slate-300">{workPackage.deliverables}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
