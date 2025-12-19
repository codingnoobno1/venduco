// Dashboard Layout - Shared wrapper for all dashboards
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/shared/Sidebar'
import { Header } from '@/components/dashboard/shared/Header'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!res.ok) {
                localStorage.removeItem('token')
                router.push('/login')
                return
            }

            const data = await res.json()
            setUser(data.data)

            // Redirect to role-specific dashboard
            const currentPath = window.location.pathname
            if (currentPath === '/dashboard') {
                const role = data.data.requestedRole || 'VENDOR'
                const roleRoutes: Record<string, string> = {
                    'ADMIN': '/dashboard/admin',
                    'PROJECT_MANAGER': '/dashboard/pm',
                    'SUPERVISOR': '/dashboard/supervisor',
                    'VENDOR': '/dashboard/vendor',
                    'COMPANY_REP': '/dashboard/company',
                }
                router.push(roleRoutes[role] || '/dashboard/vendor')
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar
                user={user}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                <Header
                    user={user}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
