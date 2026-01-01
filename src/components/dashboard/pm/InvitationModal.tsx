"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Send, Shield, Info, Users, Briefcase } from 'lucide-react'

interface InvitationModalProps {
    projectId: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function InvitationModal({ projectId, isOpen, onClose, onSuccess }: InvitationModalProps) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        userEmail: '',
        userId: '',
        invitationType: 'MEMBER',
        targetRole: 'SUPERVISOR',
        message: '',
        isAffiliated: false,      // New: invite through vendor
        vendorId: ''              // New: parent vendor
    })
    const [vendors, setVendors] = useState<any[]>([])

    const roles = [
        { value: 'SUPERVISOR', label: 'Site Supervisor', desc: 'Manage daily tasks and site logs', icon: Users },
        { value: 'INSPECTOR', label: 'Quality Inspector', desc: 'Perform site audits and issue NCRs', icon: Shield },
        { value: 'VENDOR', label: 'Subcontractor', desc: 'Execute construction work and bill progress', icon: Briefcase },
    ]

    async function handleInvite() {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            // First find user by email
            const userRes = await fetch(`/api/users/find?email=${formData.userEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const userData = await userRes.json()

            if (!userData.success) {
                alert('User not found. Please ensure the collaborator is registered.')
                return
            }

            const inviteRes = await fetch(`/api/projects/${projectId}/bidding/invitations`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vendorId: userData.data._id,
                    invitationType: formData.invitationType,
                    targetRole: formData.targetRole,
                    message: formData.message
                })
            })

            if (inviteRes.ok) {
                onSuccess()
                onClose()
            } else {
                const err = await inviteRes.json()
                alert(err.message || 'Failed to send invitation')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-xl">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invite Collaborator</h2>
                            <p className="text-xs text-slate-500">Add a member to your project terminal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Step 1: User & Role */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Collaborator Email</label>
                            <input
                                type="email"
                                value={formData.userEmail}
                                onChange={e => setFormData({ ...formData, userEmail: e.target.value })}
                                placeholder="name@company.com"
                                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Assign Role</label>
                            <div className="grid grid-cols-1 gap-3">
                                {roles.map(role => (
                                    <button
                                        key={role.value}
                                        onClick={() => setFormData({ ...formData, targetRole: role.value as any })}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${formData.targetRole === role.value
                                            ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${formData.targetRole === role.value ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            <role.icon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-bold ${formData.targetRole === role.value ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                                                {role.label}
                                            </p>
                                            <p className="text-[10px] text-slate-500">{role.desc}</p>
                                        </div>
                                        {formData.targetRole === role.value && (
                                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Join Type</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFormData({ ...formData, invitationType: 'MEMBER' })}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${formData.invitationType === 'MEMBER' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-100 dark:border-slate-700 text-slate-500'}`}
                                >
                                    DIRECT JOIN
                                </button>
                                <button
                                    disabled={formData.targetRole !== 'VENDOR'}
                                    onClick={() => setFormData({ ...formData, invitationType: 'BID' })}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${formData.invitationType === 'BID' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-100 dark:border-slate-700 text-slate-500'} ${formData.targetRole !== 'VENDOR' && 'opacity-30 cursor-not-allowed'}`}
                                >
                                    STANDARD BID
                                </button>
                            </div>
                            <div className="mt-2 flex items-start gap-2 text-[10px] text-slate-400">
                                <Info size={12} className="mt-0.5 shrink-0" />
                                <p>Direct Join bypasses bidding and adds the user as a project member immediately upon acceptance.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                        onClick={handleInvite}
                        disabled={loading || !formData.userEmail}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                        {loading ? 'Sending...' : (
                            <>
                                <Send size={18} />
                                Send Invitation
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
