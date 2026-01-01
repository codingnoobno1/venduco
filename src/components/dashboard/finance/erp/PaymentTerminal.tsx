"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    CreditCard,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    Clock,
    Search,
    Download
} from 'lucide-react'
import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

export function PaymentTerminal({ projectId }: { projectId: string }) {
    const [invoices, setInvoices] = useState([
        { id: 'INV-1002', vendor: 'InfraCorp Ltd', amount: 450000, status: 'APPROVED', date: '2025-05-15' },
        { id: 'INV-1005', vendor: 'BuildRight Solutions', amount: 1250000, status: 'PAID', date: '2025-05-10' },
    ])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Outstanding', value: '₹14.5L', icon: DollarSign, color: 'blue' },
                    { label: 'Released (MTD)', value: '₹42.0L', icon: CreditCard, color: 'emerald' },
                    { label: 'Avg Payment Turnaround', value: '4.2 Days', icon: BarChart3, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h4>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Disbursement Queue</h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><Download size={18} /></button>
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all">Batch Pay</button>
                    </div>
                </div>

                <DataTable
                    columns={[
                        { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold">{val}</span> },
                        { key: 'vendor', label: 'Vendor' },
                        { key: 'amount', label: 'Amount', render: (val) => `₹${val.toLocaleString()}` },
                        { key: 'date', label: 'Approved Date' },
                        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                        {
                            key: 'actions',
                            label: '',
                            render: (_, row) => (
                                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-widest">
                                    Release Funds <ArrowRight size={14} />
                                </button>
                            )
                        }
                    ]}
                    data={invoices}
                    pageSize={5}
                />
            </div>
        </div>
    )
}
