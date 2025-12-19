// Daily Report Form Component
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react'

interface DailyReportFormProps {
    projectId: string
    projectName: string
    onSuccess?: () => void
}

export function DailyReportForm({ projectId, projectName, onSuccess }: DailyReportFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        workDescription: '',
        workersPresent: 0,
        hoursWorked: 8,
        materialsUsed: '',
        issues: '',
        notes: '',
        weatherCondition: 'CLEAR',
        safetyIncidents: false,
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/reports/daily', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    ...formData,
                    materialsUsed: formData.materialsUsed.split(',').map(s => s.trim()).filter(Boolean),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to submit report')
            }

            setSuccess(true)
            onSuccess?.()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-8 text-center"
            >
                <CheckCircle2 size={64} className="mx-auto mb-4 text-emerald-500" />
                <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                    Report Submitted!
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300 mt-2">
                    Your daily report has been submitted for review.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg"
                >
                    Back to Dashboard
                </button>
            </motion.div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                    Daily Report for: {projectName}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-500" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Work Description */}
            <div>
                <label className="block text-sm font-medium mb-2">Work Description *</label>
                <textarea
                    required
                    rows={4}
                    value={formData.workDescription}
                    onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Describe the work completed today..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Workers */}
                <div>
                    <label className="block text-sm font-medium mb-2">Workers Present *</label>
                    <input
                        type="number"
                        required
                        min={0}
                        value={formData.workersPresent}
                        onChange={(e) => setFormData({ ...formData, workersPresent: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>

                {/* Hours */}
                <div>
                    <label className="block text-sm font-medium mb-2">Hours Worked</label>
                    <input
                        type="number"
                        min={0}
                        max={24}
                        value={formData.hoursWorked}
                        onChange={(e) => setFormData({ ...formData, hoursWorked: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>

                {/* Weather */}
                <div>
                    <label className="block text-sm font-medium mb-2">Weather</label>
                    <select
                        value={formData.weatherCondition}
                        onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                        <option value="CLEAR">Clear</option>
                        <option value="CLOUDY">Cloudy</option>
                        <option value="RAINY">Rainy</option>
                        <option value="STORMY">Stormy</option>
                        <option value="HOT">Hot</option>
                        <option value="COLD">Cold</option>
                    </select>
                </div>
            </div>

            {/* Materials */}
            <div>
                <label className="block text-sm font-medium mb-2">Materials Used</label>
                <input
                    type="text"
                    value={formData.materialsUsed}
                    onChange={(e) => setFormData({ ...formData, materialsUsed: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Cement, Steel, Concrete (comma separated)"
                />
            </div>

            {/* Issues */}
            <div>
                <label className="block text-sm font-medium mb-2">Issues / Blockers</label>
                <textarea
                    rows={2}
                    value={formData.issues}
                    onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Any issues faced today..."
                />
            </div>

            {/* Safety */}
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="safety"
                    checked={formData.safetyIncidents}
                    onChange={(e) => setFormData({ ...formData, safetyIncidents: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300"
                />
                <label htmlFor="safety" className="text-sm">
                    Any safety incidents reported?
                </label>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Any additional notes..."
                />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    Cancel
                </button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <FileText size={20} />
                            Submit Report
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    )
}
