"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Ruler, Users, Truck, CheckCircle2, AlertTriangle, Send } from 'lucide-react'

interface ProgressLoggerProps {
    projectId: string
    contractId: string
    sections: any[]
}

export function ProgressLogger({ projectId, contractId, sections }: ProgressLoggerProps) {
    const [selectedSection, setSelectedSection] = useState<string>('')
    const [formData, setFormData] = useState({
        workType: '',
        quantityDone: '',
        unit: 'm',
        progressPercent: '',
        remarks: '',
        laborCount: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const activeSection = sections.find(s => s._id === selectedSection)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/sections/progress`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sectionId: selectedSection,
                    contractId,
                    date: new Date().toISOString(),
                    workType: formData.workType,
                    quantityDone: Number(formData.quantityDone),
                    unit: formData.unit,
                    progressPercent: Number(formData.progressPercent),
                    remarks: formData.remarks,
                    resourceUsage: {
                        laborCount: Number(formData.laborCount)
                    }
                })
            })
            const data = await res.json()
            if (data.success) {
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
                setFormData({ workType: '', quantityDone: '', unit: 'm', progressPercent: '', remarks: '', laborCount: '' })
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
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="text-blue-600" size={20} />
                    Construction Execution Log
                </h3>
                <p className="text-sm text-slate-500 mt-1">Submit daily physical progress for your assigned sections</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Section Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Section (KM Marker)</label>
                        <select
                            required
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            <option value="">Choose a section...</option>
                            {sections.map(s => (
                                <option key={s._id} value={s._id}>{s.sectionCode} (Km {s.fromKm}-{s.toKm})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Work Category</label>
                        <input
                            required
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="e.g. Earthwork, PCC, Welding"
                            value={formData.workType}
                            onChange={e => setFormData({ ...formData, workType: e.target.value })}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {selectedSection && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Ruler size={14} className="text-blue-500" /> Quantity Done
                                </label>
                                <div className="flex">
                                    <input
                                        required
                                        type="number"
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-l-xl px-4 py-2"
                                        placeholder="100"
                                        value={formData.quantityDone}
                                        onChange={e => setFormData({ ...formData, quantityDone: e.target.value })}
                                    />
                                    <select
                                        className="bg-slate-100 dark:bg-slate-800 border-y border-r border-slate-200 dark:border-slate-700 rounded-r-xl px-2 text-xs font-bold"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="m">Meters</option>
                                        <option value="km">Km</option>
                                        <option value="tons">Tons</option>
                                        <option value="sqm">Sq.m</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Completion %</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="number"
                                        max="100"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                                        placeholder="20"
                                        value={formData.progressPercent}
                                        onChange={e => setFormData({ ...formData, progressPercent: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-2 text-slate-400 font-bold">%</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Users size={14} className="text-orange-500" /> Labor Count
                                </label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                                    placeholder="8"
                                    value={formData.laborCount}
                                    onChange={e => setFormData({ ...formData, laborCount: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Remarks & Challenges</label>
                    <textarea
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 min-h-[100px]"
                        placeholder="Detail any site observations or bottlenecks..."
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all">
                            <Camera size={14} /> Add Evidence Photos
                        </button>
                        <button type="button" className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg hover:bg-slate-200 transition-all">
                            <MapPin size={14} /> Tag GPS Location
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !selectedSection}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${success
                                ? 'bg-emerald-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-blue-500/20'
                            }`}
                    >
                        {submitting ? 'Submitting...' : success ? 'Successfully Logged!' : (
                            <>
                                Submit Log
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </div>

                {formData.progressPercent === '100' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3"
                    >
                        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                        <div>
                            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Section Completion Alert</p>
                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                                Marking this section as 100% will trigger a final quality audit and block updates until verified by the PM.
                            </p>
                        </div>
                    </motion.div>
                )}
            </form>
        </div>
    )
}
