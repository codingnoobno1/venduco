// Add New Machine Page
"use client"

import { MachineForm } from '@/components/dashboard/vendor/MachineForm'

export default function AddMachinePage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Add New Machine
            </h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <MachineForm />
            </div>
        </div>
    )
}
