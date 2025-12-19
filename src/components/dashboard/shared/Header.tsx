// Header Component - Top bar with notifications and theme toggle
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Menu, Search, Sun, Moon, X } from 'lucide-react'
import { useTheme } from 'next-themes'

interface HeaderProps {
    user: any
    onMenuClick: () => void
}

interface Notification {
    _id: string
    title: string
    message: string
    type: string
    isRead: boolean
    createdAt: string
}

export function Header({ user, onMenuClick }: HeaderProps) {
    const { theme, setTheme } = useTheme()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [])

    async function fetchNotifications() {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/notifications?limit=10', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.data || [])
                setUnreadCount(data.data?.filter((n: Notification) => !n.isRead).length || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    async function markAsRead(id: string) {
        try {
            const token = localStorage.getItem('token')
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchNotifications()
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        return `${Math.floor(hours / 24)}d ago`
    }

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sticky top-0 z-30">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <Menu size={20} />
                </button>

                {/* Search */}
                <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 w-64">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none ml-2 w-full text-sm"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                            >
                                <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="font-semibold">Notifications</h3>
                                    <button onClick={() => setShowNotifications(false)}>
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <p className="p-4 text-center text-slate-500">No notifications</p>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif._id}
                                                onClick={() => markAsRead(notif._id)}
                                                className={`p-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                    }`}
                                            >
                                                <p className="font-medium text-sm">{notif.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                                                <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    )
}
