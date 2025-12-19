// Machine Form Component - Add/Edit Machine
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Truck, Calendar, MapPin, CheckCircle2, AlertCircle, Hash } from 'lucide-react'

interface MachineFormProps {
    initialData?: any
    onSuccess?: () => void
}

const machineTypes = [
    'TOWER_CRANE',
    'EXCAVATOR',
    'BULLDOZER',
    'LOADER',
    'CONCRETE_MIXER',
    'TRUCK',
    'GRADER',
    'ROLLER',
    'PAVER',
    'FORKLIFT',
    'COMPACTOR',
    'DRILLING_RIG',
    'CRANE',
    'OTHER',
]

export function MachineForm({ initialData, onSuccess }: MachineFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        machineCode: initialData?.machineCode || '',
        name: initialData?.name || '',
        machineType: initialData?.machineType || 'EXCAVATOR',
        manufacturer: initialData?.manufacturer || '',
        model: initialData?.model || '',
        yearOfManufacture: initialData?.yearOfManufacture || new Date().getFullYear(),
        capacity: initialData?.capacity || '',
        location: initialData?.location || '',
        registrationNumber: initialData?.registrationNumber || '',
        insuranceExpiry: initialData?.insuranceExpiry || '',
        lastMaintenanceDate: initialData?.lastMaintenanceDate || '',
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const url = initialData?._id
                ? `/api/machines/${initialData._id}`
                : '/api/machines'

            const res = await fetch(url, {
                method: initialData?._id ? 'PUT' : 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to save machine')
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
                    Machine {initialData ? 'Updated' : 'Added'}!
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300 mt-2">
                    Your machine has been {initialData ? 'updated' : 'added to your fleet'}.
                </p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg"
                >
                    Back to Fleet
                </button>
            </motion.div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Machine Code */}
                <div>
                    <label className="block text-sm font-medium mb-2">Machine Code *</label>
                    <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            required
                            value={formData.machineCode}
                            onChange={(e) => setFormData({ ...formData, machineCode: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="TC-05"
                        />
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Tower Crane Alpha"
                    />
                </div>

                {/* Type */}
                <div>
                    <label className="block text-sm font-medium mb-2">Machine Type *</label>
                    <select
                        required
                        value={formData.machineType}
                        onChange={(e) => setFormData({ ...formData, machineType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                        {machineTypes.map((type) => (
                            <option key={type} value={type}>
                                {type.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Manufacturer */}
                <div>
                    <label className="block text-sm font-medium mb-2">Manufacturer</label>
                    <input
                        type="text"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Caterpillar, JCB, etc."
                    />
                </div>

                {/* Model */}
                <div>
                    <label className="block text-sm font-medium mb-2">Model</label>
                    <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="320D L"
                    />
                </div>

                {/* Year */}
                <div>
                    <label className="block text-sm font-medium mb-2">Year of Manufacture</label>
                    <input
                        type="number"
                        min={1990}
                        max={new Date().getFullYear()}
                        value={formData.yearOfManufacture}
                        onChange={(e) => setFormData({ ...formData, yearOfManufacture: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                </div>

                {/* Capacity */}
                <div>
                    <label className="block text-sm font-medium mb-2">Capacity</label>
                    <input
                        type="text"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="20 tons"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium mb-2">Current Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="Delhi NCR"
                        />
                    </div>
                </div>

                {/* Registration */}
                <div>
                    <label className="block text-sm font-medium mb-2">Registration Number</label>
                    <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="DL-01-ABC-1234"
                    />
                </div>

                {/* Insurance Expiry */}
                <div>
                    <label className="block text-sm font-medium mb-2">Insurance Expiry</label>
                    <input
                        type="date"
                        value={formData.insuranceExpiry}
                        onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
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
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Truck size={20} />
                            {initialData ? 'Update Machine' : 'Add Machine'}
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    )
}
