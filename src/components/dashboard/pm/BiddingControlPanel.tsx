// Bidding Control Panel Component
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings,
    Calendar,
    ToggleLeft,
    ToggleRight,
    Lock,
    Unlock,
    Users,
} from 'lucide-react'

interface BiddingControlPanelProps {
    settings: {
        biddingMode: 'CLOSED' | 'OPEN' | 'INVITE_ONLY'
        biddingEnabled: boolean
        biddingStartDate?: string
        biddingEndDate?: string
    }
    onSettingsChange: (settings: any) => void
    invitedCount?: number
}

export function BiddingControlPanel({ settings, onSettingsChange, invitedCount = 0 }: BiddingControlPanelProps) {
    const modes = [
        {
            value: 'CLOSED',
            label: 'Closed',
            desc: 'No bidding allowed',
            icon: Lock,
            color: 'slate'
        },
        {
            value: 'OPEN',
            label: 'Open',
            desc: 'All vendors can bid',
            icon: Unlock,
            color: 'green'
        },
        {
            value: 'INVITE_ONLY',
            label: 'Invite Only',
            desc: 'Selected vendors only',
            icon: Users,
            color: 'blue'
        },
    ]

    return (
        <div className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                    <Settings className="text-slate-400" size={20} />
                    <div>
                        <h3 className="font-medium">Bidding Enabled</h3>
                        <p className="text-sm text-slate-500">
                            {settings.biddingEnabled ? 'Vendors can submit bids' : 'Bidding is disabled'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onSettingsChange({ ...settings, biddingEnabled: !settings.biddingEnabled })}
                    className={`p-2 rounded-lg transition-colors ${settings.biddingEnabled
                            ? 'bg-green-100 text-green-600'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                >
                    {settings.biddingEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
            </div>

            {/* Mode Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Bidding Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {modes.map((mode) => (
                        <motion.button
                            key={mode.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSettingsChange({ ...settings, biddingMode: mode.value })}
                            className={`p-4 rounded-xl border text-left transition-all ${settings.biddingMode === mode.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <mode.icon
                                size={20}
                                className={settings.biddingMode === mode.value ? 'text-blue-600' : 'text-slate-400'}
                            />
                            <p className="font-medium mt-2">{mode.label}</p>
                            <p className="text-xs text-slate-500 mt-1">{mode.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Calendar size={14} className="inline mr-2" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={settings.biddingStartDate || ''}
                        onChange={(e) => onSettingsChange({ ...settings, biddingStartDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Calendar size={14} className="inline mr-2" />
                        End Date
                    </label>
                    <input
                        type="date"
                        value={settings.biddingEndDate || ''}
                        onChange={(e) => onSettingsChange({ ...settings, biddingEndDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Invite Only Info */}
            {settings.biddingMode === 'INVITE_ONLY' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                        <Users className="text-blue-600" size={18} />
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                            {invitedCount} vendor{invitedCount !== 1 ? 's' : ''} invited
                        </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Only invited vendors can view and bid on this project
                    </p>
                </div>
            )}
        </div>
    )
}
