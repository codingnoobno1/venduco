"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Ruler, Trash2, MapPin } from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

interface SectionManagerProps {
    projectId: string
}

export function SectionManager({ projectId }: SectionManagerProps) {
    const [sections, setSections] = useState<any[]>([])
    const [assignments, setAssignments] = useState<any[]>([])
    const [contracts, setContracts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [assignForm, setAssignForm] = useState({
        contractId: '',
        plannedStart: '',
        plannedEnd: ''
    })
    const [formData, setFormData] = useState({
        sectionCode: '',
        fromKm: '',
        toKm: '',
        description: ''
    })

    useEffect(() => {
        fetchData()
    }, [projectId])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            const [secRes, assignRes, contractRes] = await Promise.all([
                fetch(`/api/projects/${projectId}/sections`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/projects/${projectId}/sections/assignments`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/invoices?projectId=${projectId}`, { headers: { Authorization: `Bearer ${token}` } }) // Need a real contracts API, reusing for now or Mock
            ])

            const secData = await secRes.json()
            const assignData = await assignRes.json()

            if (secData.success) setSections(secData.data)
            if (assignData.success) setAssignments(assignData.data)

            // Fetch contracts for assignment
            const contractsRes = await fetch(`/api/projects/${projectId}/contracts`, { headers: { Authorization: `Bearer ${token}` } })
            const contractsData = await contractsRes.json()
            if (contractsData.success) setContracts(contractsData.data)

        } catch (err) {
            console.error('Failed to fetch sections:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/sections`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    fromKm: Number(formData.fromKm),
                    toKm: Number(formData.toKm)
                })
            })
            const data = await res.json()
            if (data.success) {
                setShowModal(false)
                setFormData({ sectionCode: '', fromKm: '', toKm: '', description: '' })
                fetchData()
            } else {
                alert(data.message)
            }
        } catch (err) {
            console.error('Create error:', err)
        }
    }

    async function handleAssign(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedSectionId) return

        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/sections/assignments`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sectionId: selectedSectionId,
                    contractId: assignForm.contractId,
                    plannedStart: assignForm.plannedStart,
                    plannedEnd: assignForm.plannedEnd
                })
            })
            const data = await res.json()
            if (data.success) {
                setAssignModalOpen(false)
                setAssignForm({ contractId: '', plannedStart: '', plannedEnd: '' })
                setSelectedSectionId(null)
                fetchData()
            } else {
                alert(data.message)
            }
        } catch (err) {
            console.error('Assignment error:', err)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Route Segmentation</h3>
                    <p className="text-sm text-slate-500">Define km-based sections for the project</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus size={18} />
                    Add Section
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <DataTable
                    columns={[
                        { key: 'sectionCode', label: 'Section ID', sortable: true, render: (val) => <span className="font-mono font-bold text-blue-600">{val}</span> },
                        {
                            key: 'range',
                            label: 'Chainage (KM)',
                            render: (_, row) => (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span>{row.fromKm} - {row.toKm}</span>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 rounded uppercase">{row.lengthKm} KM</span>
                                </div>
                            )
                        },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        {
                            key: 'assignee',
                            label: 'Assigned Vendor',
                            render: (_, row) => {
                                const assign = assignments.find(a => String(a.sectionId?._id || a.sectionId) === String(row._id))
                                return assign ? (
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-slate-400" />
                                        <span className="text-sm font-medium">{assign.contractId?.vendorId?.name || 'Assigned'}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setSelectedSectionId(row._id)
                                            setAssignModalOpen(true)
                                        }}
                                        className="text-xs text-blue-600 hover:underline font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"
                                    >
                                        Assign Vendor
                                    </button>
                                )
                            }
                        },
                        {
                            key: 'actions',
                            label: '',
                            render: (_, row) => (
                                <div className="flex gap-2">
                                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><Trash2 size={16} className="text-red-500" /></button>
                                </div>
                            )
                        }
                    ]}
                    data={sections}
                    pageSize={5}
                />
            </div>

            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700"
                        >
                            <h3 className="text-xl font-bold mb-4">Create New Section</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section Code</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                        placeholder="e.g. CP-304"
                                        value={formData.sectionCode}
                                        onChange={e => setFormData({ ...formData, sectionCode: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From (KM)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                            placeholder="304"
                                            value={formData.fromKm}
                                            onChange={e => setFormData({ ...formData, fromKm: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To (KM)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                            placeholder="305"
                                            value={formData.toKm}
                                            onChange={e => setFormData({ ...formData, toKm: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
            }

            {/* Assignment Modal */}
            {
                assignModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700"
                        >
                            <h3 className="text-xl font-bold mb-4">Assign Vendor to Section</h3>
                            <form onSubmit={handleAssign} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Vendor (Contract)</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                        value={assignForm.contractId}
                                        onChange={e => setAssignForm({ ...assignForm, contractId: e.target.value })}
                                    >
                                        <option value="">Select a vendor...</option>
                                        {contracts.map(c => (
                                            <option key={c._id} value={c._id}>
                                                {c.vendorId?.name || 'Unknown Vendor'} ({c.contractNumber})
                                            </option>
                                        ))}
                                    </select>
                                    {contracts.length === 0 && (
                                        <p className="text-xs text-amber-500 mt-1">No active contracts found for this project.</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Planned Start</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                            value={assignForm.plannedStart}
                                            onChange={e => setAssignForm({ ...assignForm, plannedStart: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Planned End</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                            value={assignForm.plannedEnd}
                                            onChange={e => setAssignForm({ ...assignForm, plannedEnd: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setAssignModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!assignForm.contractId}
                                    >
                                        Confirm Assignment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
            }
        </div >
    )
}
