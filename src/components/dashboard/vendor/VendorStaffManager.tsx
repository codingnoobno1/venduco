"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Briefcase, Calendar, Trash2 } from 'lucide-react'

export function VendorStaffManager({ vendorId }: { vendorId: string }) {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newStaff, setNewStaff] = useState({
        userEmail: '',
        designation: '',
        employmentType: 'CONTRACT'
    })

    useEffect(() => {
        fetchStaff()
    }, [vendorId])

    async function fetchStaff() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/vendors/${vendorId}/staff`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setStaff(data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function addStaff() {
        const token = localStorage.getItem('token')
        try {
            // First find user by email
            const userRes = await fetch(`/api/users/find?email=${newStaff.userEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const userData = await userRes.json()

            if (!userData.success) {
                alert('User not found')
                return
            }

            const res = await fetch(`/api/vendors/${vendorId}/staff`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userData.data._id,
                    designation: newStaff.designation,
                    employmentType: newStaff.employmentType
                })
            })

            if (res.ok) {
                fetchStaff()
                setShowAddModal(false)
                setNewStaff({ userEmail: '', designation: '', employmentType: 'CONTRACT' })
            }
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading staff...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">My Staff</h2>
                        <p className="text-sm text-slate-500">Manage your employed supervisors and workers</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Add Staff
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map(member => (
                    <motion.div
                        key={member._id}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{member.userName}</h3>
                                <p className="text-sm text-slate-500">{member.designation}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${member.employmentType === 'PERMANENT' ? 'bg-green-100 text-green-700' :
                                            member.employmentType === 'CONTRACT' ? 'bg-blue-100 text-blue-700' :
                                                'bg-purple-100 text-purple-700'
                                        }`}>
                                        {member.employmentType}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                    <Calendar size={12} />
                                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {staff.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-slate-400">
                        <Users size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No staff members yet</p>
                    </div>
                )}
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md"
                    >
                        <h3 className="text-xl font-bold mb-4">Add Staff Member</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newStaff.userEmail}
                                    onChange={e => setNewStaff({ ...newStaff, userEmail: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="supervisor@example.com"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Designation</label>
                                <input
                                    value={newStaff.designation}
                                    onChange={e => setNewStaff({ ...newStaff, designation: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Site Supervisor"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Employment Type</label>
                                <select
                                    value={newStaff.employmentType}
                                    onChange={e => setNewStaff({ ...newStaff, employmentType: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                >
                                    <option value="CONTRACT">Contract</option>
                                    <option value="PERMANENT">Permanent</option>
                                    <option value="FREELANCE">Freelance</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addStaff}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                            >
                                Add
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
