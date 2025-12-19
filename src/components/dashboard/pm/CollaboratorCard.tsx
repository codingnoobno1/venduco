// Collaborator Card Component
"use client"

import { motion } from 'framer-motion'
import {
    Crown,
    Shield,
    Mail,
    MoreVertical,
    UserMinus,
    Settings,
} from 'lucide-react'
import { useState } from 'react'

interface CollaboratorCardProps {
    collaborator: {
        userId: string
        userName: string
        userEmail?: string
        role: 'ADMIN_PM' | 'COLLABORATOR_PM'
        status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REMOVED'
        permissions?: string[]
        isCreator?: boolean
    }
    isAdminView?: boolean
    onRemove?: (userId: string) => void
    onManagePermissions?: (userId: string) => void
}

export function CollaboratorCard({ collaborator, isAdminView = false, onRemove, onManagePermissions }: CollaboratorCardProps) {
    const [showMenu, setShowMenu] = useState(false)

    const isAdmin = collaborator.role === 'ADMIN_PM'
    const isPending = collaborator.status === 'PENDING'

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl border ${isAdmin
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${isAdmin
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-500'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                    }`}>
                    {collaborator.userName?.[0]?.toUpperCase() || 'P'}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium">{collaborator.userName}</h4>
                        {isAdmin && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
                                <Crown size={10} />
                                Admin
                            </span>
                        )}
                        {isPending && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
                                Pending
                            </span>
                        )}
                    </div>

                    {collaborator.userEmail && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Mail size={12} />
                            {collaborator.userEmail}
                        </p>
                    )}

                    {collaborator.permissions && collaborator.permissions.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Shield size={10} />
                            {collaborator.permissions.length} permissions
                        </p>
                    )}
                </div>

                {/* Actions Menu */}
                {isAdminView && !isAdmin && collaborator.status !== 'REMOVED' && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10">
                                {onManagePermissions && (
                                    <button
                                        onClick={() => {
                                            onManagePermissions(collaborator.userId)
                                            setShowMenu(false)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                    >
                                        <Settings size={14} />
                                        Manage Permissions
                                    </button>
                                )}
                                {onRemove && (
                                    <button
                                        onClick={() => {
                                            onRemove(collaborator.userId)
                                            setShowMenu(false)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    >
                                        <UserMinus size={14} />
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
