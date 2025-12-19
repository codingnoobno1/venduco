// PM Settings Page
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Save,
    Camera,
    Mail,
    Phone,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function PMSettingsPage() {
    const { theme, setTheme } = useTheme()
    const [activeTab, setActiveTab] = useState('profile')
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        title: '',
    })
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        reports: true,
        bids: true,
        chat: true,
    })

    useEffect(() => {
        // Load user data from localStorage or API
        const userData = localStorage.getItem('user')
        if (userData) {
            const user = JSON.parse(userData)
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                company: user.company || '',
                title: 'Project Manager',
            })
        }
    }, [])

    async function handleSave() {
        setSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
    }

    const tabs = [
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'appearance', label: 'Appearance', icon: Palette },
        { key: 'security', label: 'Security', icon: Shield },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account and preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.key
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <tab.icon size={20} />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Profile Information</h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {profile.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <Camera size={16} />
                                    Change Photo
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={profile.title}
                                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
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
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Notification Preferences</h2>

                            <div className="space-y-4">
                                {[
                                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { key: 'push', label: 'Push Notifications', desc: 'Get instant alerts on your device' },
                                    { key: 'reports', label: 'Daily Reports', desc: 'Notify when new reports are submitted' },
                                    { key: 'bids', label: 'New Bids', desc: 'Alert when vendors submit bids' },
                                    { key: 'chat', label: 'Chat Messages', desc: 'Notify for new chat messages' },
                                ].map(item => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
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
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Appearance</h2>

                            <div>
                                <label className="block text-sm font-medium mb-3">Theme</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'light', label: 'Light' },
                                        { key: 'dark', label: 'Dark' },
                                        { key: 'system', label: 'System' },
                                    ].map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => setTheme(t.key)}
                                            className={`p-4 rounded-xl border-2 transition-colors ${theme === t.key
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className={`w-full h-12 rounded-lg mb-2 ${t.key === 'light' ? 'bg-white border' :
                                                    t.key === 'dark' ? 'bg-slate-800' :
                                                        'bg-gradient-to-r from-white to-slate-800'
                                                }`} />
                                            <p className="font-medium text-sm">{t.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Security</h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <p className="font-medium">Change Password</p>
                                    <p className="text-sm text-slate-500 mb-3">Update your password regularly</p>
                                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                        Update Password
                                    </button>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <p className="font-medium">Two-Factor Authentication</p>
                                    <p className="text-sm text-slate-500 mb-3">Add an extra layer of security</p>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                                <Save size={18} />
                            )}
                            Save Changes
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )
}
