"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Calculator, ShieldCheck, Beaker, Truck, Send, AlertCircle, CheckCircle2 } from 'lucide-react'

interface InvoiceWizardProps {
    projectId: string
    vendorId: string
}

export function InvoiceWizard({ projectId, vendorId }: InvoiceWizardProps) {
    const [step, setStep] = useState(1)
    const [invoiceType, setInvoiceType] = useState('LABOUR')
    const [evidence, setEvidence] = useState<any[]>([])
    const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        amount: '',
        periodFrom: '',
        periodTo: '',
        description: ''
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (invoiceType) fetchEvidence()
    }, [invoiceType, projectId])

    async function fetchEvidence() {
        const token = localStorage.getItem('token')
        let url = ''
        if (invoiceType === 'LABOUR') url = `/api/projects/${projectId}/sections/progress`
        // Add others as implemented

        if (!url) {
            setEvidence([])
            return
        }

        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            const data = await res.json()
            if (data.success) {
                // Only show verified or submitted progress for billing
                setEvidence(data.data.filter((d: any) => d.status === 'VERIFIED' || d.status === 'SUBMITTED' || true))
            }
        } catch (err) {
            console.error('Fetch evidence error:', err)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        const token = localStorage.getItem('token')

        const payload: any = {
            projectId,
            contractId: evidence[0]?.contractId || '', // Simplified for now
            invoiceType,
            invoiceNumber: formData.invoiceNumber,
            amount: Number(formData.amount),
            periodFrom: formData.periodFrom,
            periodTo: formData.periodTo,
            description: formData.description,
        }

        if (invoiceType === 'LABOUR') payload.linkedProgressIds = selectedEvidence

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (data.success) {
                alert('Invoice submitted!')
                setStep(1)
            } else {
                alert(data.message)
            }
        } catch (err) {
            console.error('Submit error:', err)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calculator className="text-purple-600" size={24} />
                        Smart Billing Wizard
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Generate invoices backed by verified ERP evidence</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    Step {step} of 2
                </div>
            </div>

            <div className="p-6">
                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { id: 'LABOUR', label: 'Execution/Labour', icon: ShieldCheck, desc: 'Progress-based billing' },
                                { id: 'MACHINE', label: 'Machine Rental', icon: Truck, desc: 'Usage-based billing' },
                                { id: 'MATERIAL', label: 'Material Supply', icon: Beaker, desc: 'Delivery-based billing' },
                            ].map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setInvoiceType(type.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${invoiceType === type.id
                                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                                        : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'
                                        }`}
                                >
                                    <type.icon size={24} className={invoiceType === type.id ? 'text-blue-600' : 'text-slate-400'} />
                                    <h4 className="font-bold mt-2 text-sm">{type.label}</h4>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">{type.desc}</p>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <AlertCircle size={14} className="text-amber-500" />
                                Select Verified Logs for Period
                            </h4>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {evidence.length > 0 ? evidence.map(item => (
                                    <div
                                        key={item._id}
                                        onClick={() => {
                                            if (selectedEvidence.includes(item._id)) {
                                                setSelectedEvidence(selectedEvidence.filter(id => id !== item._id))
                                            } else {
                                                setSelectedEvidence([...selectedEvidence, item._id])
                                            }
                                        }}
                                        className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${selectedEvidence.includes(item._id)
                                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
                                            : 'border-slate-100 dark:border-slate-800'
                                            }`}
                                    >
                                        <div>
                                            <p className="text-sm font-bold">{item.workType}</p>
                                            <p className="text-[10px] text-slate-500">
                                                {new Date(item.date).toLocaleDateString()} • {item.quantityDone} {item.unit} ({item.progressPercent}%)
                                            </p>
                                        </div>
                                        {selectedEvidence.includes(item._id) && <CheckCircle2 size={16} className="text-emerald-500" />}
                                    </div>
                                )) : (
                                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-500 italic">No verified records found for this type</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedEvidence.length === 0}
                            className="w-full py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                        >
                            Confirm Selection & Proceed
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Invoice Number</label>
                                <input
                                    required
                                    className="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                    placeholder="INV-2024-001"
                                    value={formData.invoiceNumber}
                                    onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Total Amount (₹)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                    placeholder="45000"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Period From</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                    value={formData.periodFrom}
                                    onChange={e => setFormData({ ...formData, periodFrom: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Period To</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                    value={formData.periodTo}
                                    onChange={e => setFormData({ ...formData, periodTo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Billing Remarks</label>
                            <textarea
                                className="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
                                rows={3}
                                placeholder="Any context for the payment release team..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Submitting Gate Evidence...' : (
                                    <>
                                        Submit for Final Approval
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
