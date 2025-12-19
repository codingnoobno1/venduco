// Supervisor Dashboard
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    FolderKanban,
    Clock,
    FileText,
    Truck,
    MapPin,
    Camera,
    CheckCircle2,
    PlayCircle,
    PauseCircle,
    Calendar,
    MessageSquare,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { MachineCard } from '@/components/dashboard/shared/MachineCard'
import { ActivityFeed } from '@/components/dashboard/shared/ActivityFeed'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { QuickAction } from '@/components/dashboard/shared/QuickAction'

export default function SupervisorDashboard() {
    const router = useRouter()
    const [projects, setProjects] = useState<any[]>([])
    const [machines, setMachines] = useState<any[]>([])
    const [isClockedIn, setIsClockedIn] = useState(false)
    const [clockInTime, setClockInTime] = useState<Date | null>(null)
    const [loading, setLoading] = useState(true)
    const [todayReportSubmitted, setTodayReportSubmitted] = useState(false)

    useEffect(() => {
        fetchData()
        // Check clock-in status from localStorage
        const clockedIn = localStorage.getItem('clockedIn')
        if (clockedIn) {
            setIsClockedIn(true)
            setClockInTime(new Date(clockedIn))
        }
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // Fetch assigned projects
            const projectsRes = await fetch('/api/projects/my', { headers })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])

            // Mock machines assigned
            setMachines([
                { _id: '1', machineCode: 'TC-05', machineType: 'TOWER_CRANE', status: 'ASSIGNED', location: 'Site A' },
                { _id: '2', machineCode: 'EX-03', machineType: 'EXCAVATOR', status: 'IN_USE', location: 'Site B' },
            ])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleClockInOut() {
        const token = localStorage.getItem('token')

        if (!isClockedIn) {
            // Clock In - Get GPS location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        await fetch('/api/location/update', {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                            })
                        })
                    } catch (e) {
                        console.error('Location update failed:', e)
                    }
                })
            }

            const now = new Date()
            localStorage.setItem('clockedIn', now.toISOString())
            setIsClockedIn(true)
            setClockInTime(now)
        } else {
            // Clock Out
            localStorage.removeItem('clockedIn')
            setIsClockedIn(false)
            setClockInTime(null)
        }
    }

    function getWorkDuration() {
        if (!clockInTime) return '0h 0m'
        const diff = Date.now() - clockInTime.getTime()
        const hours = Math.floor(diff / 3600000)
        const mins = Math.floor((diff % 3600000) / 60000)
        return `${hours}h ${mins}m`
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton type="stat" count={4} />
                <LoadingSkeleton type="card" count={2} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Supervisor Dashboard</h1>
                    <p className="text-slate-500 mt-1">Field operations at a glance</p>
                </div>

                {/* Clock In/Out Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClockInOut}
                    className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${isClockedIn
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}
                >
                    {isClockedIn ? (
                        <>
                            <PauseCircle size={20} />
                            Clock Out ({getWorkDuration()})
                        </>
                    ) : (
                        <>
                            <PlayCircle size={20} />
                            Clock In
                        </>
                    )}
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Assigned Projects"
                    value={projects.length}
                    icon={FolderKanban}
                    color="blue"
                />
                <StatCard
                    title="Today's Hours"
                    value={isClockedIn ? getWorkDuration() : '0h'}
                    icon={Clock}
                    color={isClockedIn ? 'green' : 'orange'}
                />
                <StatCard
                    title="Machines"
                    value={machines.length}
                    icon={Truck}
                    color="purple"
                />
                <StatCard
                    title="Today's Report"
                    value={todayReportSubmitted ? 'Submitted' : 'Pending'}
                    icon={FileText}
                    color={todayReportSubmitted ? 'green' : 'orange'}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickAction
                    title="Submit Daily Report"
                    description={todayReportSubmitted ? 'Already submitted' : 'Required today'}
                    icon={FileText}
                    color="orange"
                    onClick={() => router.push('/dashboard/supervisor/report')}
                />
                <QuickAction
                    title="Update Location"
                    description="Share GPS position"
                    icon={MapPin}
                    color="blue"
                    onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(async (pos) => {
                                const token = localStorage.getItem('token')
                                await fetch('/api/location/update', {
                                    method: 'POST',
                                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
                                })
                                alert('Location updated!')
                            })
                        }
                    }}
                />
                <QuickAction
                    title="Upload Photos"
                    description="Site progress images"
                    icon={Camera}
                    color="green"
                    onClick={() => router.push('/dashboard/supervisor/photos')}
                />
                <QuickAction
                    title="Project Chat"
                    description="Team messages"
                    icon={MessageSquare}
                    color="purple"
                    onClick={() => router.push('/dashboard/supervisor/chat')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assigned Projects */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Projects</h3>
                    <div className="space-y-4">
                        {projects.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                                <FolderKanban size={48} className="mx-auto mb-2 text-slate-400" />
                                <p className="text-slate-500">No projects assigned</p>
                            </div>
                        ) : (
                            projects.slice(0, 3).map((project) => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    onClick={() => router.push(`/dashboard/supervisor/projects/${project._id}`)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Assigned Machines */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Machines</h3>
                    <div className="space-y-4">
                        {machines.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                                <Truck size={48} className="mx-auto mb-2 text-slate-400" />
                                <p className="text-slate-500">No machines assigned</p>
                            </div>
                        ) : (
                            machines.map((machine) => (
                                <MachineCard
                                    key={machine._id}
                                    machine={machine}
                                    onClick={() => router.push(`/dashboard/supervisor/machines/${machine._id}`)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bidding Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bidding Opportunities</h3>
                    <a href="/dashboard/supervisor/bids" className="text-sm text-blue-600 hover:underline">View All</a>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                    Submit bids on open projects to get assigned.
                </p>
                <button
                    onClick={() => router.push('/dashboard/supervisor/bids')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium"
                >
                    Browse Open Projects
                </button>
            </div>
        </div>
    )
}
