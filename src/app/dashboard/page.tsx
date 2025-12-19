// Simple Dashboard Page (protected)
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, User } from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token")
        const userData = localStorage.getItem("user")

        if (!token || !userData) {
            router.push("/login")
            return
        }

        setUser(JSON.parse(userData))
        setLoading(false)
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        VendorConnect Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Welcome, {user?.name}!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Account Status
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {user?.isActive ? "✓ Active" : "✗ Inactive"}
                            </p>
                        </div>

                        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Email Verified
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {user?.emailVerified ? "✓ Verified" : "✗ Not Verified"}
                            </p>
                        </div>

                        {user?.phone && (
                            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                    Phone Number
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{user.phone}</p>
                            </div>
                        )}

                        <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Member Since
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {new Date(user?.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                            🎉 You're successfully logged in!
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            This is a protected dashboard. Only authenticated users can see this page.
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
