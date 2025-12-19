// PM Bidding Control Page
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Settings,
    Calendar,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Send,
    RefreshCw,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/shared/StatCard'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function BiddingControlPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [project, setProject] = useState<any>(null)
    const [settings, setSettings] = useState({
        biddingMode: 'CLOSED',
        biddingEnabled: false,
        biddingStartDate: '',
        biddingEndDate: '',
    })
    const [invitationCount, setInvitationCount] = useState(0)

    useEffect(() => {
        fetchData()
    }, [projectId])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            // Fetch bidding settings
            const res = await fetch(`/api/projects/${projectId}/bidding`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setProject(data.data)
                setSettings({
                    biddingMode: data.data.biddingMode || 'CLOSED',
                    biddingEnabled: data.data.biddingEnabled || false,
                    biddingStartDate: data.data.biddingStartDate?.split('T')[0] || '',
                    biddingEndDate: data.data.biddingEndDate?.split('T')[0] || '',
                })
                setInvitationCount(data.data.allowedVendorCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/projects/${projectId}/bidding`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })
            fetchData()
        } catch (error) {
            console.error('Failed to save:', error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Bidding Control
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {project?.projectName} ({project?.projectCode})
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Bidding Status"
                    value={settings.biddingEnabled ? 'Enabled' : 'Disabled'}
                    icon={settings.biddingEnabled ? CheckCircle2 : XCircle}
                    color={settings.biddingEnabled ? 'green' : 'slate'}
                />
                <StatCard
                    title="Mode"
                    value={settings.biddingMode.replace('_', ' ')}
                    icon={Settings}
                    color="blue"
                />
                <StatCard
                    title="Invited Vendors"
                    value={invitationCount}
                    icon={Users}
                    color="purple"
                />
            </div>

            {/* Settings Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold mb-6">Bidding Settings</h2>

                <div className="space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <div>
                            <h3 className="font-medium">Enable Bidding</h3>
                            <p className="text-sm text-slate-500">Allow vendors to submit bids</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, biddingEnabled: !settings.biddingEnabled })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${settings.biddingEnabled ? 'bg-green-500' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.biddingEnabled ? 'left-7' : 'left-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Bidding Mode */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Bidding Mode</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'CLOSED', label: 'Closed', desc: 'No bidding allowed' },
                                { value: 'OPEN', label: 'Open', desc: 'All vendors can bid' },
                                { value: 'INVITE_ONLY', label: 'Invite Only', desc: 'Only invited vendors' },
                            ].map((mode) => (
                                <button
                                    key={mode.value}
                                    onClick={() => setSettings({ ...settings, biddingMode: mode.value })}
                                    className={`p-4 rounded-xl border text-left transition-colors ${settings.biddingMode === mode.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <p className="font-medium">{mode.label}</p>
                                    <p className="text-xs text-slate-500 mt-1">{mode.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Calendar size={14} className="inline mr-2" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={settings.biddingStartDate}
                                onChange={(e) => setSettings({ ...settings, biddingStartDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Clock size={14} className="inline mr-2" />
                                End Date
                            </label>
                            <input
                                type="date"
                                value={settings.biddingEndDate}
                                onChange={(e) => setSettings({ ...settings, biddingEndDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                            {saving ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            Save Settings
                        </motion.button>

                        {settings.biddingMode === 'INVITE_ONLY' && (
                            <button
                                onClick={() => router.push(`/dashboard/pm/projects/${projectId}/bidding/invitations`)}
                                className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <Send size={18} />
                                Manage Invitations
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
