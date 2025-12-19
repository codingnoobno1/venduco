// Rental Listing Form Component
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Truck, DollarSign, Calendar, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'

interface RentalListingFormProps {
    onSuccess?: () => void
}

export function RentalListingForm({ onSuccess }: RentalListingFormProps) {
    const router = useRouter()
    const [machines, setMachines] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingMachines, setFetchingMachines] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        machineId: '',
        dailyRate: 0,
        weeklyRate: 0,
        monthlyRate: 0,
        location: '',
        availableFrom: '',
        availableTo: '',
    })

    useEffect(() => {
        fetchMachines()
    }, [])

    async function fetchMachines() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/machines', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            // Filter only available machines
            setMachines((data.data || []).filter((m: any) => m.status === 'AVAILABLE'))
        } catch (err) {
            console.error('Failed to fetch machines:', err)
        } finally {
            setFetchingMachines(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/machinerentals', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'LIST_FOR_RENT',
                    ...formData,
                    weeklyRate: formData.weeklyRate || undefined,
                    monthlyRate: formData.monthlyRate || undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to list machine')
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
                    Machine Listed!
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300 mt-2">
                    Your machine is now available for rent.
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

    if (fetchingMachines) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-500" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Machine Selection */}
            <div>
                <label className="block text-sm font-medium mb-2">Select Machine *</label>
                <select
                    required
                    value={formData.machineId}
                    onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                    <option value="">Choose a machine...</option>
                    {machines.map((machine) => (
                        <option key={machine._id} value={machine._id}>
                            {machine.machineCode} - {machine.machineType?.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>
                {machines.length === 0 && (
                    <p className="text-sm text-orange-600 mt-2">
                        No available machines to list. Add machines first.
                    </p>
                )}
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Daily Rate (₹) *</label>
                    <input
                        type="number"
                        required
                        min={0}
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Weekly Rate (₹)</label>
                    <input
                        type="number"
                        min={0}
                        value={formData.weeklyRate}
                        onChange={(e) => setFormData({ ...formData, weeklyRate: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Optional"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Monthly Rate (₹)</label>
                    <input
                        type="number"
                        min={0}
                        value={formData.monthlyRate}
                        onChange={(e) => setFormData({ ...formData, monthlyRate: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Optional"
                    />
                </div>
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Delhi NCR, Mumbai, etc."
                    />
                </div>
            </div>

            {/* Availability Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Available From</label>
                    <input
                        type="date"
                        value={formData.availableFrom}
                        onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Available Until</label>
                    <input
                        type="date"
                        value={formData.availableTo}
                        onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>
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
                    disabled={loading || machines.length === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            Listing...
                        </>
                    ) : (
                        <>
                            <Truck size={20} />
                            List for Rent
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    )
}
