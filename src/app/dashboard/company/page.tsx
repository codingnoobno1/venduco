// Company Representative Dashboard
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Users,
    FolderKanban,
    Truck,
    FileText,
    Building2,
    TrendingUp,
    DollarSign,
    BarChart3,
    Download,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { ProjectCard } from '@/components/dashboard/shared/ProjectCard'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { QuickAction } from '@/components/dashboard/shared/QuickAction'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

export default function CompanyDashboard() {
    const router = useRouter()
    const [employees, setEmployees] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [fleet, setFleet] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        employees: 0,
        activeEmployees: 0,
        projects: 0,
        machines: 0,
        revenue: 0,
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // In real app, these would be company-specific endpoints
            // For now, using general endpoints with mock data

            // Mock employees
            setEmployees([
                { _id: '1', name: 'Rahul Kumar', email: 'rahul@company.com', role: 'SUPERVISOR', status: 'ACTIVE', projectsAssigned: 2 },
                { _id: '2', name: 'Amit Singh', email: 'amit@company.com', role: 'VENDOR', status: 'ACTIVE', projectsAssigned: 1 },
                { _id: '3', name: 'Priya Sharma', email: 'priya@company.com', role: 'SUPERVISOR', status: 'ACTIVE', projectsAssigned: 3 },
            ])

            // Fetch projects (company's projects)
            const projectsRes = await fetch('/api/projects/my', { headers })
            const projectsData = await projectsRes.json()
            setProjects(projectsData.data || [])

            // Mock fleet
            setFleet([
                { _id: '1', machineCode: 'TC-01', machineType: 'TOWER_CRANE', status: 'ASSIGNED', operator: 'Rahul Kumar' },
                { _id: '2', machineCode: 'EX-02', machineType: 'EXCAVATOR', status: 'AVAILABLE', operator: null },
            ])

            setStats({
                employees: 3,
                activeEmployees: 3,
                projects: (projectsData.data || []).length,
                machines: 2,
                revenue: 450000,
            })
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton type="stat" count={4} />
                <LoadingSkeleton type="table" count={5} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of your organization</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    <Download size={18} />
                    Export Report
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Employees" value={stats.employees} icon={Users} color="blue" />
                <StatCard title="Active Projects" value={stats.projects} icon={FolderKanban} color="green" />
                <StatCard title="Fleet Size" value={stats.machines} icon={Truck} color="orange" />
                <StatCard
                    title="Revenue"
                    value={`₹${(stats.revenue / 1000).toFixed(0)}K`}
                    icon={DollarSign}
                    color="purple"
                    trend={{ value: 8, isUp: true }}
                />
                <StatCard title="Active Staff" value={stats.activeEmployees} icon={TrendingUp} color="green" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickAction
                    title="Employees"
                    description="Manage team members"
                    icon={Users}
                    color="blue"
                    onClick={() => router.push('/dashboard/company/employees')}
                />
                <QuickAction
                    title="Projects"
                    description="View assignments"
                    icon={FolderKanban}
                    color="green"
                    onClick={() => router.push('/dashboard/company/projects')}
                />
                <QuickAction
                    title="Fleet"
                    description="Company machines"
                    icon={Truck}
                    color="orange"
                    onClick={() => router.push('/dashboard/company/fleet')}
                />
                <QuickAction
                    title="Reports"
                    description="Performance analytics"
                    icon={BarChart3}
                    color="purple"
                    onClick={() => router.push('/dashboard/company/reports')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employees */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Employees</h3>
                        <a href="/dashboard/company/employees" className="text-sm text-blue-600 hover:underline">View All</a>
                    </div>
                    <DataTable
                        columns={[
                            { key: 'name', label: 'Name', sortable: true },
                            { key: 'role', label: 'Role', render: (val) => <StatusBadge status={val} /> },
                            { key: 'projectsAssigned', label: 'Projects' },
                            { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        ]}
                        data={employees}
                        searchable={false}
                        pageSize={5}
                    />
                </div>

                {/* Company Projects */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Projects</h3>
                        <a href="/dashboard/company/projects" className="text-sm text-blue-600 hover:underline">View All</a>
                    </div>
                    <div className="space-y-4">
                        {projects.slice(0, 3).map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onClick={() => router.push(`/dashboard/company/projects/${project._id}`)}
                            />
                        ))}
                        {projects.length === 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                                <FolderKanban size={48} className="mx-auto mb-2 text-slate-400" />
                                <p className="text-slate-500">No active projects</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Company Fleet */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Company Fleet</h3>
                    <a href="/dashboard/company/fleet" className="text-sm text-blue-600 hover:underline">View All</a>
                </div>
                <DataTable
                    columns={[
                        { key: 'machineCode', label: 'Machine', sortable: true },
                        { key: 'machineType', label: 'Type', render: (val) => val.replace(/_/g, ' ') },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        { key: 'operator', label: 'Operator', render: (val) => val || '-' },
                    ]}
                    data={fleet}
                    searchable={false}
                    pageSize={5}
                />
            </div>
        </div>
    )
}
