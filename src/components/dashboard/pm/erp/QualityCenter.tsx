"use client"

import { useState, useEffect } from 'react'
import { FileText, ShieldCheck, Beaker, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

interface QualityCenterProps {
    projectId: string
}

export function QualityCenter({ projectId }: QualityCenterProps) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [inspections, setInspections] = useState<any[]>([])
    const [ncrs, setNcrs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeView, setActiveView] = useState<'billing' | 'ncrs'>('billing')

    useEffect(() => {
        fetchData()
    }, [projectId])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            const [invRes, insRes, ncrRes] = await Promise.all([
                fetch(`/api/invoices?projectId=${projectId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/inspections?projectId=${projectId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/ncrs?projectId=${projectId}`, { headers: { Authorization: `Bearer ${token}` } })
            ])

            const invData = invRes.ok ? await invRes.json() : { success: false, data: [] }
            const insData = insRes.ok ? await insRes.json() : { success: false, data: [] }
            const ncrData = ncrRes.ok ? await ncrRes.json() : { success: false, data: [] }

            if (invData.success) setInvoices(invData.data)
            if (insData.success) setInspections(insData.data)
            if (ncrData.success) setNcrs(ncrData.data)
        } catch (err) {
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    const stats = [
        { label: 'Active Critical NCRs', value: ncrs.filter(n => n.severity === 'CRITICAL' && n.status !== 'CLOSED').length, icon: AlertCircle, color: 'red' },
        { label: 'Pending Gate Approvals', value: invoices.filter(i => i.status === 'SUBMITTED').length, icon: FileText, color: 'blue' },
        { label: 'Scheduled Inspections', value: inspections.filter(i => i.status === 'SCHEDULED').length, icon: ShieldCheck, color: 'orange' },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/40`}>
                            <stat.icon className={`text-${stat.color}-600`} size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={() => setActiveView('billing')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeView === 'billing' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        Quality-Gate Invoices
                    </button>
                    <button
                        onClick={() => setActiveView('ncrs')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeView === 'ncrs' ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        Non-Conformance Reports (NCR)
                    </button>
                </div>

                {activeView === 'billing' ? (
                    <DataTable
                        columns={[
                            { key: 'invoiceNumber', label: 'Invoice #', sortable: true, render: (val) => <span className="font-mono font-bold">{val}</span> },
                            { key: 'invoiceType', label: 'Type' },
                            {
                                key: 'vendor',
                                label: 'Vendor',
                                render: (_, row) => (
                                    <div className="text-sm">
                                        <p className="font-medium text-slate-900 dark:text-white">{row.vendorId?.businessName || row.vendorId?.name}</p>
                                        <p className="text-slate-500 text-xs">{row.vendorId?.email}</p>
                                    </div>
                                )
                            },
                            {
                                key: 'qualityStatus',
                                label: 'Quality Gate',
                                render: (_, row) => {
                                    const statusMap: any = {
                                        SUBMITTED: { icon: Clock, text: 'Awaiting Inspection', color: 'slate' },
                                        INSPECTION_ASSIGNED: { icon: ShieldCheck, text: 'Site Verifying', color: 'orange' },
                                        TESTING_REQUIRED: { icon: Beaker, text: 'In Laboratory', color: 'purple' },
                                        APPROVED: { icon: CheckCircle2, text: 'Verified', color: 'emerald' },
                                        REJECTED: { icon: XCircle, text: 'Gate Failed', color: 'red' }
                                    }
                                    const s = statusMap[row.status] || { icon: AlertCircle, text: row.status, color: 'slate' }
                                    return (
                                        <div className={`flex items-center gap-1.5 text-xs font-bold text-${s.color}-600`}>
                                            <s.icon size={14} />
                                            {s.text}
                                        </div>
                                    )
                                }
                            },
                            { key: 'amount', label: 'Amount', render: (val) => `₹${val.toLocaleString()}` },
                            {
                                key: 'actions',
                                label: '',
                                render: (_, row) => (
                                    <button className="text-blue-600 hover:underline font-medium text-sm">Review</button>
                                )
                            }
                        ]}
                        data={invoices}
                        pageSize={10}
                    />
                ) : (
                    <DataTable
                        columns={[
                            { key: 'task', label: 'Task / Item', render: (_, row) => <span className="font-bold">{row.taskId?.taskCode || 'Project Level'}</span> },
                            { key: 'severity', label: 'Severity', render: (val) => <StatusBadge status={val} /> },
                            { key: 'issueType', label: 'Issue Type' },
                            { key: 'status', label: 'Lifecycle', render: (val) => <StatusBadge status={val} /> },
                            { key: 'raisedBy', label: 'Raised By', render: (val) => val?.name || 'Inspector' },
                            {
                                key: 'actions',
                                label: '',
                                render: (_, row) => (
                                    <button className="text-blue-600 hover:underline font-medium text-sm">Forensics</button>
                                )
                            }
                        ]}
                        data={ncrs}
                        pageSize={10}
                    />
                )}
            </div>
        </div>
    )
}
