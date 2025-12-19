// Create Project Page
"use client"

import { ProjectCreationWizard } from '@/components/dashboard/pm/ProjectCreationWizard'

export default function CreateProjectPage() {
    return (
        <div className="py-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Create New Project
            </h1>
            <ProjectCreationWizard />
        </div>
    )
}
