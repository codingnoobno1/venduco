// Single Machine Detail Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Edit2,
    Trash2,
    MapPin,
    Calendar,
    DollarSign,
    Truck,
    Wrench,
    Clock,
    AlertTriangle,
    MoreVertical,
} from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { Timeline } from '@/components/dashboard/shared/Timeline'

export default function MachineDetailPage({ params }: { params: Promise<{ machineId: string }> }) {
    const { machineId } = use(params)
    const router = useRouter()
    const [machine, setMachine] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        fetchMachine()
    }, [machineId])

    async function fetchMachine() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/machines/${machineId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setMachine(data.data)
            } else {
                router.push('/dashboard/vendor/fleet')
            }
        } catch (error) {
            console.error('Failed to fetch machine:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this machine?')) return

        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/machines/${machineId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            router.push('/dashboard/vendor/fleet')
        } catch (error) {
            console.error('Failed to delete machine:', error)
        }
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />
    }

    if (!machine) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Machine not found</p>
            </div>
        )
    }

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'assignments', label: 'Assignments' },
        { key: 'maintenance', label: 'Maintenance' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {machine.machineCode}
                            </h1>
                            <StatusBadge status={machine.status} size="md" />
                        </div>
                        <p className="text-slate-500 mt-1">
                            {machine.machineType?.replace(/_/g, ' ')} • {machine.manufacturer} {machine.model}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/dashboard/vendor/fleet/${machineId}/edit`)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Hours"
                    value={machine.totalHours || 0}
                    icon={Clock}
                    color="blue"
                />
                <StatCard
                    title="Earnings"
                    value={`₹${(machine.totalEarnings || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Assignments"
                    value={machine.assignmentCount || 0}
                    icon={Truck}
                    color="purple"
                />
                <StatCard
                    title="Last Service"
                    value={machine.lastMaintenanceDate ? new Date(machine.lastMaintenanceDate).toLocaleDateString() : 'N/A'}
                    icon={Wrench}
                    color="orange"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex gap-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Machine Details */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Machine Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500">Type</p>
                                <p className="font-medium">{machine.machineType?.replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Manufacturer</p>
                                <p className="font-medium">{machine.manufacturer || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Model</p>
                                <p className="font-medium">{machine.model || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Year</p>
                                <p className="font-medium">{machine.yearOfManufacture || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Capacity</p>
                                <p className="font-medium">{machine.capacity || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Registration</p>
                                <p className="font-medium">{machine.registrationNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Location</p>
                                <p className="font-medium flex items-center gap-1">
                                    <MapPin size={14} />
                                    {machine.location || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500">Insurance Expiry</p>
                                <p className="font-medium">
                                    {machine.insuranceExpiry ? new Date(machine.insuranceExpiry).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                                <DollarSign size={18} />
                                List for Rent
                            </button>
                            <button className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                                <Wrench size={18} />
                                Log Maintenance
                            </button>
                            <button className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                                <MapPin size={18} />
                                Update Location
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'assignments' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 text-center py-8">Assignment history coming soon</p>
                </div>
            )}

            {activeTab === 'maintenance' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 text-center py-8">Maintenance log coming soon</p>
                </div>
            )}
        </div>
    )
}
