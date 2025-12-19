// Bid Form Component
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DollarSign, CheckCircle2, AlertCircle, Calendar, Truck, Users } from 'lucide-react'

interface BidFormProps {
    projectId: string
    projectName: string
    projectBudget?: number
    onSuccess?: () => void
}

export function BidForm({ projectId, projectName, projectBudget, onSuccess }: BidFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        proposedAmount: projectBudget ? Math.floor(projectBudget * 0.8) : 0,
        startDate: '',
        endDate: '',
        manpowerOffered: 10,
        proposal: '',
        relevantExperience: '',
        pastProjects: '',
    })

    function calculateDays() {
        if (!formData.startDate || !formData.endDate) return 0
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/projects/${projectId}/bids`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proposedAmount: formData.proposedAmount,
                    timeline: {
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                        durationDays: calculateDays(),
                    },
                    manpowerOffered: formData.manpowerOffered,
                    proposal: formData.proposal,
                    relevantExperience: formData.relevantExperience,
                    pastProjects: formData.pastProjects.split(',').map(s => s.trim()).filter(Boolean),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to submit bid')
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
                    Bid Submitted!
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300 mt-2">
                    Your bid has been submitted. You'll be notified when it's reviewed.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg"
                >
                    Back to Opportunities
                </button>
            </motion.div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                    Bidding for: {projectName}
                </p>
                {projectBudget && (
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Estimated Budget: ₹{projectBudget.toLocaleString()}
                    </p>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-500" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Amount */}
            <div>
                <label className="block text-sm font-medium mb-2">Proposed Amount (₹) *</label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="number"
                        required
                        min={0}
                        value={formData.proposedAmount}
                        onChange={(e) => setFormData({ ...formData, proposedAmount: parseInt(e.target.value) })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Proposed Start Date *</label>
                    <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Proposed End Date *</label>
                    <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>
            </div>

            {calculateDays() > 0 && (
                <p className="text-sm text-slate-500">
                    Duration: {calculateDays()} days
                </p>
            )}

            {/* Manpower */}
            <div>
                <label className="block text-sm font-medium mb-2">Manpower Available</label>
                <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="number"
                        min={1}
                        value={formData.manpowerOffered}
                        onChange={(e) => setFormData({ ...formData, manpowerOffered: parseInt(e.target.value) })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>
            </div>

            {/* Proposal */}
            <div>
                <label className="block text-sm font-medium mb-2">Proposal / Approach</label>
                <textarea
                    rows={4}
                    value={formData.proposal}
                    onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Describe your approach to this project..."
                />
            </div>

            {/* Experience */}
            <div>
                <label className="block text-sm font-medium mb-2">Relevant Experience</label>
                <textarea
                    rows={2}
                    value={formData.relevantExperience}
                    onChange={(e) => setFormData({ ...formData, relevantExperience: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Your experience with similar projects..."
                />
            </div>

            {/* Past Projects */}
            <div>
                <label className="block text-sm font-medium mb-2">Past Projects</label>
                <input
                    type="text"
                    value={formData.pastProjects}
                    onChange={(e) => setFormData({ ...formData, pastProjects: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Project A, Project B (comma separated)"
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
                            <DollarSign size={20} />
                            Submit Bid
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    )
}
