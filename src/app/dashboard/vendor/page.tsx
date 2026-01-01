// Vendor Dashboard
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Truck,
    DollarSign,
    Briefcase,
    Wrench,
    FolderKanban,
    PlusCircle,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { MachineCard } from '@/components/dashboard/shared/MachineCard'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { ActivityFeed } from '@/components/dashboard/shared/ActivityFeed'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { QuickAction } from '@/components/dashboard/shared/QuickAction'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { VendorCapabilityProfile } from '@/components/dashboard/vendor/VendorCapabilityProfile'
import { VendorStaffManager } from '@/components/dashboard/vendor/VendorStaffManager'
import { use } from 'react'

export default function VendorDashboard() {
    const router = useRouter()
    const [vendorId, setVendorId] = useState('')
    const [machines, setMachines] = useState<any[]>([])
    const [myBids, setMyBids] = useState<any[]>([])
    const [rentalRequests, setRentalRequests] = useState<any[]>([])
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalMachines: 0,
        available: 0,
        assigned: 0,
        listedForRent: 0,
        pendingBids: 0,
        approvedBids: 0,
        rentalRequests: 0,
        earnings: 0,
    })

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]))
            setVendorId(payload.userId)
        }
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // Fetch my machines
            const machinesRes = await fetch('/api/machines', { headers })
            const machinesData = await machinesRes.json()
            const myMachines = machinesData.data || []
            setMachines(myMachines)

            // Fetch my bids
            const bidsRes = await fetch('/api/bids/my', { headers })
            const bidsData = await bidsRes.json()
            setMyBids(bidsData.data || [])

            // Fetch rental requests for my machines
            const rentalsRes = await fetch('/api/machinerentals?view=vendor-requests', { headers })
            const rentalsData = await rentalsRes.json()
            setRentalRequests(rentalsData.data || [])

            // Calculate stats
            setStats({
                totalMachines: myMachines.length,
                available: myMachines.filter((m: any) => m.status === 'AVAILABLE').length,
                assigned: myMachines.filter((m: any) => m.status === 'ASSIGNED').length,
                listedForRent: 0, // From rentals
                pendingBids: (bidsData.data || []).filter((b: any) => b.status === 'SUBMITTED').length,
                approvedBids: (bidsData.data || []).filter((b: any) => b.status === 'APPROVED').length,
                rentalRequests: (rentalsData.data || []).filter((r: any) => r.status === 'REQUESTED').length,
                earnings: 125000, // Placeholder
            })

            // Fetch real activities from audit logs
            const logsRes = await fetch('/api/audit-logs?limit=10', { headers })
            const logsData = await logsRes.json()
            const realActivities = (logsData.data || []).map((log: any) => ({
                id: log._id,
                type: log.entityType?.toLowerCase() || 'general',
                title: log.action.replace('_', ' '),
                description: log.description,
                timestamp: log.timestamp
            }))
            setActivities(realActivities)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleApproveRental(rentalId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/machinerentals/${rentalId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'APPROVE' })
            })
            fetchData()
        } catch (error) {
            console.error('Failed to approve rental:', error)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton type="stat" count={4} />
                <LoadingSkeleton type="card" count={3} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your fleet and earnings</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/profile')}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium flex items-center gap-2"
                    >
                        <User size={18} />
                        My Profile
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/dashboard/vendor/fleet/add')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        Add Machine
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Machines" value={stats.totalMachines} icon={Truck} color="blue" />
                <StatCard title="Available" value={stats.available} icon={CheckCircle2} color="green" />
                <StatCard title="Rental Requests" value={stats.rentalRequests} icon={Briefcase} color="orange" />
                <StatCard
                    title="Total Earnings"
                    value={`₹${stats.earnings.toLocaleString()}`}
                    icon={DollarSign}
                    color="purple"
                    trend={{ value: 15, isUp: true }}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickAction
                    title="List for Rent"
                    description="Make machines available"
                    icon={Briefcase}
                    color="blue"
                    onClick={() => router.push('/dashboard/vendor/rentals')}
                />
                <QuickAction
                    title="Bidding"
                    description={`${stats.pendingBids} pending`}
                    icon={DollarSign}
                    color="green"
                    onClick={() => router.push('/dashboard/vendor/bids')}
                />
                <QuickAction
                    title="Maintenance"
                    description="Log service records"
                    icon={Wrench}
                    color="orange"
                    onClick={() => router.push('/dashboard/vendor/maintenance')}
                />
                <QuickAction
                    title="Assignments"
                    description={`${stats.assigned} machines`}
                    icon={FolderKanban}
                    color="purple"
                    onClick={() => router.push('/dashboard/vendor/assignments')}
                />
            </div>

            {/* Staff Management Section */}
            {vendorId && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-3xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
                    <VendorStaffManager vendorId={vendorId} />
                </div>
            )}

            {/* Capability Profile Section */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <VendorCapabilityProfile />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Fleet */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Fleet</h3>
                        <a href="/dashboard/vendor/fleet" className="text-sm text-blue-600 hover:underline">View All</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {machines.slice(0, 4).map((machine) => (
                            <MachineCard
                                key={machine._id}
                                machine={machine}
                                onClick={() => router.push(`/dashboard/vendor/fleet/${machine._id}`)}
                            />
                        ))}
                        {machines.length === 0 && (
                            <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                                <Truck size={48} className="mx-auto mb-2 text-slate-400" />
                                <p className="text-slate-500">No machines in fleet</p>
                                <button
                                    onClick={() => router.push('/dashboard/vendor/fleet/add')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                                >
                                    Add Your First Machine
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity */}
                <div>
                    <ActivityFeed activities={activities} />
                </div>
            </div>

            {/* Rental Requests */}
            {rentalRequests.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Rental Requests</h3>
                    <DataTable
                        columns={[
                            { key: 'machineCode', label: 'Machine', sortable: true },
                            { key: 'requestedByName', label: 'Requested By', sortable: true },
                            { key: 'projectName', label: 'Project' },
                            { key: 'requestedDays', label: 'Duration', render: (val) => `${val} days` },
                            { key: 'proposedRate', label: 'Rate', render: (val) => `₹${val?.toLocaleString()}/day` },
                            { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                            {
                                key: 'actions',
                                label: '',
                                render: (_, row) => row.status === 'REQUESTED' && (
                                    <button
                                        onClick={() => handleApproveRental(row._id)}
                                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium"
                                    >
                                        Approve
                                    </button>
                                )
                            }
                        ]}
                        data={rentalRequests}
                        searchable={false}
                        pageSize={5}
                    />
                </div>
            )}

            {/* My Bids */}
            {myBids.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Bids</h3>
                    <DataTable
                        columns={[
                            { key: 'projectName', label: 'Project', sortable: true },
                            { key: 'proposedAmount', label: 'Amount', render: (val) => `₹${val?.toLocaleString()}` },
                            { key: 'timeline.durationDays', label: 'Duration', render: (_, row) => `${row.timeline?.durationDays || 0} days` },
                            { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                            { key: 'submittedAt', label: 'Submitted', render: (val) => new Date(val).toLocaleDateString() },
                        ]}
                        data={myBids}
                        searchable={false}
                        pageSize={5}
                    />
                </div>
            )}
        </div>
    )
}
