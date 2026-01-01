// Project Creation Wizard - Main Component
"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { ProjectDetailsStep } from './ProjectDetailsStep'
import { DepartmentsStep } from './DepartmentsStep'
import { BiddingStep } from './BiddingStep'
import { ReviewStep } from './ReviewStep'

export interface WorkPackage {
    id: string
    nature: 'SUPPLIER' | 'SUB_CONTRACTOR'
    scope: string
    budget: number
    material?: string
    quantity?: string
    deliverables?: string
    boqFileUrl?: string
}

export interface Department {
    name: string
    isSelected: boolean
    workPackages: WorkPackage[]
}

export interface ProjectFormData {
    // Step 0: Details
    name: string
    projectCode: string
    location: string
    clientName: string
    projectType: string
    startDate: string
    endDate: string
    planningStatus: string
    budget: number
    minExperience: number
    requiredBrands: string
    maintenancePeriod: number
    description: string
    imageUrl?: string

    // Step 1: Departments
    departments: Department[]

    // Step 2: Bidding (New)
    biddingMode: 'OPEN' | 'INVITE_ONLY'
    biddingEnabled: boolean
    biddingStartDate?: string
    biddingEndDate?: string
    allowedVendorIds?: string[]
}

const INITIAL_DEPARTMENTS: Department[] = [
    { name: 'OHE / Electrical', isSelected: false, workPackages: [] },
    { name: 'Civil', isSelected: false, workPackages: [] },
    { name: 'Signal', isSelected: false, workPackages: [] },
    { name: 'Telecom', isSelected: false, workPackages: [] },
    { name: 'Buildings', isSelected: false, workPackages: [] },
]

const STEPS = ['Details', 'Departments', 'Bidding', 'Review']

interface ProjectWizardProps {
    initialData?: Partial<ProjectFormData>
    projectId?: string
}

export function ProjectCreationWizard({ initialData, projectId }: ProjectWizardProps) {
    const isEdit = !!projectId
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        projectCode: '',
        location: '',
        clientName: '',
        projectType: 'CONSTRUCTION',
        startDate: '',
        endDate: '',
        planningStatus: 'IDEATION',
        budget: 0,
        minExperience: 0,
        requiredBrands: '',
        maintenancePeriod: 1,
        description: '',
        imageUrl: '',
        departments: initialData?.departments || INITIAL_DEPARTMENTS,
        biddingMode: initialData?.biddingMode || 'OPEN',
        biddingEnabled: initialData?.biddingEnabled !== undefined ? initialData.biddingEnabled : true,
        biddingStartDate: initialData?.biddingStartDate?.split('T')[0] || '',
        biddingEndDate: initialData?.biddingEndDate?.split('T')[0] || '',
    })

    function updateFormData(updates: Partial<ProjectFormData>) {
        setFormData(prev => ({ ...prev, ...updates }))
    }

    function nextStep() {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    async function handlePublish() {
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')

            // Prepare data
            const projectData = {
                name: formData.name,
                projectCode: formData.projectCode,
                location: formData.location,
                clientName: formData.clientName,
                projectType: formData.projectType,
                startDate: formData.startDate,
                deadline: formData.endDate,
                planningStatus: formData.planningStatus,
                budget: formData.budget,
                minExperience: formData.minExperience,
                requiredBrands: formData.requiredBrands,
                maintenancePeriod: formData.maintenancePeriod,
                description: formData.description,
                imageUrl: formData.imageUrl,
                departments: formData.departments.filter(d => d.isSelected),
                biddingMode: formData.biddingMode,
                biddingEnabled: formData.biddingEnabled,
                biddingStartDate: formData.biddingStartDate,
                biddingEndDate: formData.biddingEndDate,
                allowedVendorIds: formData.allowedVendorIds,
            }

            const url = isEdit ? `/api/projects/${projectId}` : '/api/projects'
            const method = isEdit ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to create project')
            }

            // Redirect to project page
            const id = data.data.projectId || data.data._id
            router.push(`/dashboard/pm/projects/${id}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => (
                        <div key={step} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${index < currentStep
                                ? 'bg-emerald-500 text-white'
                                : index === currentStep
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                }`}>
                                {index < currentStep ? <Check size={20} /> : index + 1}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${index === currentStep ? 'text-blue-600' : 'text-slate-500'
                                }`}>
                                {step}
                            </span>
                            {index < STEPS.length - 1 && (
                                <div className={`w-20 md:w-32 h-1 mx-4 rounded-full ${index < currentStep ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                    <X className="text-red-500" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Step Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentStep === 0 && (
                            <ProjectDetailsStep
                                data={formData}
                                onChange={updateFormData}
                            />
                        )}
                        {currentStep === 1 && (
                            <DepartmentsStep
                                departments={formData.departments}
                                onChange={(departments) => updateFormData({ departments })}
                            />
                        )}
                        {currentStep === 2 && (
                            <BiddingStep
                                data={formData}
                                onChange={updateFormData}
                            />
                        )}
                        {currentStep === 3 && (
                            <ReviewStep
                                data={formData}
                                onEdit={(step) => setCurrentStep(step)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
                <button
                    onClick={currentStep === 0 ? () => router.back() : prevStep}
                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft size={20} />
                    {currentStep === 0 ? 'Cancel' : 'Previous'}
                </button>

                {currentStep < STEPS.length - 1 ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={nextStep}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2"
                    >
                        Next
                        <ChevronRight size={20} />
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePublish}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                {isEdit ? 'Update Project' : 'Publish Project'}
                            </>
                        )}
                    </motion.button>
                )}
            </div>
        </div>
    )
}
