// Shared authenticated dashboard shell
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/shared/Sidebar'
import { Header } from '@/components/dashboard/shared/Header'
import { PageContextBar } from '@/components/dashboard/shared/PageContextBar'
import { AuthProvider, useAuth } from '@/context/AuthContext'

interface DashboardLayoutProps {
    children: React.ReactNode
}

function DashboardInnerLayout({ children }: DashboardLayoutProps) {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        if (loading) return
        if (!user) {
            router.push('/login')
            return
        }

        if (window.location.pathname === '/dashboard') {
            const roleRoutes: Record<string, string> = {
                ADMIN: '/dashboard/admin',
                PROJECT_HEAD: '/dashboard/pm',
                EPC_MANAGER: '/dashboard/pm',
                SUPERVISOR: '/dashboard/supervisor',
                VENDOR: '/dashboard/vendor',
                CONSULTANT: '/dashboard/consultant',
                CONTRACTOR: '/dashboard/contractor',
                SUBCONTRACTOR: '/dashboard/subcontractor',
            }
            router.push(roleRoutes[user.role] || '/dashboard/vendor')
        }
    }, [user, loading, router])

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f3f6fb]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />
                    <p className="text-sm font-medium text-slate-500">Loading secure workspace…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f3f6fb] text-[#0f1b2d]">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(current => !current)} />
            {sidebarOpen && (
                <button
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden"
                />
            )}
            <div className={`min-h-screen transition-[padding] duration-200 ${sidebarOpen ? 'lg:pl-[248px]' : 'lg:pl-[76px]'}`}>
                <Header user={user} onMenuClick={() => setSidebarOpen(current => !current)} />
                <main className="px-4 pb-6 pt-3 sm:px-5 lg:px-6">
                    <PageContextBar />
                    {children}
                </main>
            </div>
        </div>
    )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <AuthProvider>
            <DashboardInnerLayout>{children}</DashboardInnerLayout>
        </AuthProvider>
    )
}
