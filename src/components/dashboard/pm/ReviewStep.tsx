// Review Step - Step 2 of Creation Wizard
"use client"

import { motion } from 'framer-motion'
import {
    Building2,
    MapPin,
    Calendar,
    DollarSign,
    Users,
    Package,
    Wrench,
    Edit2,
    Image,
    User,
    Tag,
    Clock,
    Briefcase,
} from 'lucide-react'
import type { ProjectFormData } from './ProjectCreationWizard'

interface ReviewStepProps {
    data: ProjectFormData
    onEdit: (step: number) => void
}

export function ReviewStep({ data, onEdit }: ReviewStepProps) {
    const selectedDepartments = data.departments.filter(d => d.isSelected)
    const totalWorkPackages = selectedDepartments.reduce((acc, d) => acc + d.workPackages.length, 0)
    const totalWPBudget = selectedDepartments.reduce(
        (acc, d) => acc + d.workPackages.reduce((sum, wp) => sum + wp.budget, 0),
        0
    )

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    Review & Publish
                </h2>
                <p className="text-slate-500 text-sm">
                    Review your project details before publishing
                </p>
            </div>

            {/* Project Details Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 size={20} />
                        Project Details
                    </h3>
                    <button
                        onClick={() => onEdit(0)}
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                        <Edit2 size={14} />
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={Building2} label="Project Name" value={data.name} />
                    <InfoItem icon={Tag} label="Project Code" value={data.projectCode} />
                    <InfoItem icon={MapPin} label="Location" value={data.location} />
                    <InfoItem icon={User} label="Client" value={data.clientName} />
                    <InfoItem icon={Briefcase} label="Type" value={data.projectType} />
                    <InfoItem icon={Tag} label="Status" value={data.planningStatus} />
                    <InfoItem icon={Calendar} label="Start Date" value={data.startDate} />
                    <InfoItem icon={Calendar} label="End Date" value={data.endDate} />
                    <InfoItem icon={DollarSign} label="Total Budget" value={`₹${data.budget.toLocaleString()}`} />
                    <InfoItem icon={Briefcase} label="Min Experience" value={`${data.minExperience} years`} />
                    <InfoItem icon={Tag} label="Required Brands" value={data.requiredBrands || 'Not specified'} />
                    <InfoItem icon={Clock} label="Maintenance Period" value={`${data.maintenancePeriod} years`} />
                </div>

                {data.description && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Description:</strong> {data.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Departments & Work Packages Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users size={20} />
                        Departments & Work Packages
                    </h3>
                    <button
                        onClick={() => onEdit(1)}
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                        <Edit2 size={14} />
                        Edit
                    </button>
                </div>

                {selectedDepartments.length === 0 ? (
                    <p className="text-slate-500 text-sm">No departments selected</p>
                ) : (
                    <div className="space-y-4">
                        {selectedDepartments.map((dept) => (
                            <div
                                key={dept.name}
                                className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                            >
                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                                    {dept.name}
                                </h4>

                                {dept.workPackages.length === 0 ? (
                                    <p className="text-sm text-slate-500">No work packages</p>
                                ) : (
                                    <div className="space-y-2">
                                        {dept.workPackages.map((wp, index) => (
                                            <div
                                                key={wp.id}
                                                className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {wp.nature === 'SUPPLIER' ? (
                                                        <Package size={16} className="text-blue-500" />
                                                    ) : (
                                                        <Wrench size={16} className="text-purple-500" />
                                                    )}
                                                    <span className="truncate max-w-xs">
                                                        {wp.scope || `Work Package #${index + 1}`}
                                                    </span>
                                                </div>
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                                    ₹{wp.budget.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
                    <span className="text-slate-500">
                        {selectedDepartments.length} department(s), {totalWorkPackages} work package(s)
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                        Total: ₹{totalWPBudget.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Project Image Preview */}
            {data.imageUrl && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Image size={20} />
                        Project Image
                    </h3>
                    <img
                        src={data.imageUrl}
                        alt="Project"
                        className="rounded-xl max-h-48 object-cover"
                    />
                </div>
            )}

            {/* Budget Validation */}
            {data.budget > 0 && totalWPBudget > data.budget && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4"
                >
                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                        ⚠️ Work package budget (₹{totalWPBudget.toLocaleString()}) exceeds total project budget (₹{data.budget.toLocaleString()})
                    </p>
                </motion.div>
            )}

            {/* Ready to Publish */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                    ✅ Your project is ready to be published!
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    Click "Publish Project" to create the project and start accepting bids.
                </p>
            </div>
        </div>
    )
}

// Info Item Sub-component
function InfoItem({
    icon: Icon,
    label,
    value
}: {
    icon: any
    label: string
    value: string
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon size={16} className="text-slate-400 mt-0.5" />
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{value || '-'}</p>
            </div>
        </div>
    )
}
