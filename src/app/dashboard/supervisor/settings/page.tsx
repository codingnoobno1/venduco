// Supervisor Settings Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Bell,
    Save,
    Camera,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SupervisorSettingsPage() {
    const { theme, setTheme } = useTheme()
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
    })
    const [notifications, setNotifications] = useState({
        reportReminder: true,
        projectUpdates: true,
        messages: true,
    })

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            const user = JSON.parse(userData)
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            })
        }
    }, [])

    async function handleSave() {
        setSaving(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account preferences</p>
            </div>

            {/* Profile */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User size={20} />
                    Profile
                </h2>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {profile.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2">
                        <Camera size={16} />
                        Change Photo
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell size={20} />
                    Notifications
                </h2>

                <div className="space-y-4">
                    {[
                        { key: 'reportReminder', label: 'Daily Report Reminder', desc: 'Get reminded to submit daily reports' },
                        { key: 'projectUpdates', label: 'Project Updates', desc: 'Notifications about project changes' },
                        { key: 'messages', label: 'Messages', desc: 'New message notifications' },
                    ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                                className={`w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications]
                                        ? 'bg-blue-600'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Theme */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold mb-4">Theme</h2>
                <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`p-3 rounded-xl border-2 ${theme === t ? 'border-blue-600' : 'border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Save */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {saving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save size={18} />}
                Save Changes
            </motion.button>
        </div>
    )
}
