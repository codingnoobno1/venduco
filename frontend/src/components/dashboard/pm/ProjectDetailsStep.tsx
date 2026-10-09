// Project Details Step - Step 0 of Creation Wizard
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Building2,
    MapPin,
    Calendar,
    DollarSign,
    Briefcase,
    Clock,
    Tag,
    ImagePlus,
    User,
} from 'lucide-react'
import type { ProjectFormData } from './ProjectCreationWizard'

interface ProjectDetailsStepProps {
    data: ProjectFormData
    onChange: (updates: Partial<ProjectFormData>) => void
}

const PROJECT_TYPES = [
    { value: 'RAILWAY', label: 'Railway' },
    { value: 'METRO', label: 'Metro' },
    { value: 'CONSTRUCTION', label: 'Construction' },
    { value: 'INDUSTRIAL', label: 'Industrial' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { value: 'OTHER', label: 'Other' },
]

const PLANNING_STATUSES = [
    { value: 'IDEATION', label: 'Ideation' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PRE_BID', label: 'Pre-Bid' },
    { value: 'BIDDING_OPEN', label: 'Bidding Open' },
    { value: 'AWARDED', label: 'Awarded' },
]

export function ProjectDetailsStep({ data, onChange }: ProjectDetailsStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    Project Details
                </h2>
                <p className="text-slate-500 text-sm">
                    Enter the basic information about your project
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                        Project Name *
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => onChange({ name: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Metro Line Extension Phase 2"
                        />
                    </div>
                </div>

                {/* Project Code */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Project Code *
                    </label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            required
                            value={data.projectCode}
                            onChange={(e) => onChange({ projectCode: e.target.value.toUpperCase() })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase"
                            placeholder="METRO-PH2"
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Location *
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            required
                            value={data.location}
                            onChange={(e) => onChange({ location: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="Delhi NCR"
                        />
                    </div>
                </div>

                {/* Client Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Client Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            required
                            value={data.clientName}
                            onChange={(e) => onChange({ clientName: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="Delhi Metro Rail Corporation"
                        />
                    </div>
                </div>

                {/* Project Type */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Project Type *
                    </label>
                    <select
                        value={data.projectType}
                        onChange={(e) => onChange({ projectType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                        {PROJECT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        required
                        value={data.startDate}
                        onChange={(e) => onChange({ startDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        End Date *
                    </label>
                    <input
                        type="date"
                        required
                        value={data.endDate}
                        onChange={(e) => onChange({ endDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>

                {/* Planning Status */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Planning Status
                    </label>
                    <select
                        value={data.planningStatus}
                        onChange={(e) => onChange({ planningStatus: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                        {PLANNING_STATUSES.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                </div>

                {/* Total Budget */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Total Budget (₹) *
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="number"
                            required
                            min={0}
                            value={data.budget}
                            onChange={(e) => onChange({ budget: parseInt(e.target.value) || 0 })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="10000000"
                        />
                    </div>
                </div>

                {/* Min Experience */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Min Experience (Years)
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="number"
                            min={0}
                            max={50}
                            value={data.minExperience}
                            onChange={(e) => onChange({ minExperience: parseInt(e.target.value) || 0 })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="5"
                        />
                    </div>
                </div>

                {/* Required Brands */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Required Brands
                    </label>
                    <input
                        type="text"
                        value={data.requiredBrands}
                        onChange={(e) => onChange({ requiredBrands: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Caterpillar, JCB, L&T"
                    />
                </div>

                {/* Maintenance Period */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Maintenance Period (Years)
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="number"
                            min={0}
                            max={10}
                            value={data.maintenancePeriod}
                            onChange={(e) => onChange({ maintenancePeriod: parseInt(e.target.value) || 0 })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="2"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <textarea
                        rows={3}
                        value={data.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Brief description of the project..."
                    />
                </div>

                {/* Image Upload Placeholder */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                        Project Image (Optional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <ImagePlus size={40} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            PNG, JPG up to 5MB
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
