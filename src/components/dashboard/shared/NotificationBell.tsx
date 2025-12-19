// Notification Bell Component
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    async function fetchNotifications() {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const res = await fetch('/api/notifications?limit=10', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setNotifications(data.data || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    async function markAsRead(notificationId?: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    notificationId ? { notificationId } : { markAllRead: true }
                )
            })
            fetchNotifications()
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    function handleNotificationClick(notification: any) {
        markAsRead(notification._id)
        if (notification.link) {
            router.push(notification.link)
        }
        setShowDropdown(false)
    }

    const typeIcons: Record<string, string> = {
        ISSUE_RAISED: '⚠️',
        ISSUE_RESOLVED: '✅',
        MATERIAL_QUOTED: '💰',
        MATERIAL_APPROVED: '📦',
        ATTENDANCE_SUBMITTED: '👷',
        DAY_LOCKED: '🔒',
        MENTION: '@',
        ANNOUNCEMENT: '📌',
        TASK_ASSIGNED: '📋',
        BID_RECEIVED: '🎯',
        RENTAL_REQUEST: '🚜',
        GENERAL: '💬',
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b flex items-center justify-between">
                                <h3 className="font-semibold">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAsRead()}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-96 overflow-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">
                                        <Bell size={32} className="mx-auto mb-2 text-slate-400" />
                                        <p className="text-sm">No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <button
                                            key={notif._id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`w-full p-3 text-left border-b hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <span className="text-xl">
                                                    {typeIcons[notif.type] || '💬'}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    {notif.title && (
                                                        <p className="font-medium text-sm truncate">
                                                            {notif.title}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="p-2 border-t text-center">
                                <button
                                    onClick={() => {
                                        router.push('/notifications')
                                        setShowDropdown(false)
                                    }}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    View all notifications
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
