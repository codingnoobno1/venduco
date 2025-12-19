// Supervisor Single Report View
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Calendar,
    Users,
    Clock,
    CloudSun,
    CheckCircle2,
    XCircle,
    MessageSquare,
} from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function SupervisorReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
    const { reportId } = use(params)
    const router = useRouter()
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReport()
    }, [reportId])

    async function fetchReport() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setReport(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch report:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Report not found</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-600">Go back</button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Daily Report
                    </h1>
                    <p className="text-slate-500">
                        {new Date(report.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <StatusBadge status={report.reviewStatus || 'PENDING'} size="md" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border text-center">
                    <Users className="mx-auto text-blue-500 mb-2" size={24} />
                    <p className="text-2xl font-bold">{report.workersPresent || 0}</p>
                    <p className="text-xs text-slate-500">Workers Present</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border text-center">
                    <Clock className="mx-auto text-purple-500 mb-2" size={24} />
                    <p className="text-2xl font-bold">{report.hoursWorked || 0}</p>
                    <p className="text-xs text-slate-500">Hours Worked</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border text-center">
                    <CloudSun className="mx-auto text-orange-500 mb-2" size={24} />
                    <p className="text-lg font-bold">{report.weatherCondition || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Weather</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border text-center">
                    <Calendar className="mx-auto text-emerald-500 mb-2" size={24} />
                    <p className="text-lg font-bold">{report.shift || 'Day'}</p>
                    <p className="text-xs text-slate-500">Shift</p>
                </div>
            </div>

            {/* Work Completed */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    Work Completed
                </h3>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {report.workCompleted || 'No details provided'}
                </p>
            </div>

            {/* Issues */}
            {report.issues && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <XCircle className="text-red-500" size={20} />
                        Issues / Delays
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {report.issues}
                    </p>
                </div>
            )}

            {/* Materials Used */}
            {report.materialsUsed && report.materialsUsed.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <h3 className="font-semibold mb-3">Materials Used</h3>
                    <div className="divide-y">
                        {report.materialsUsed.map((material: any, idx: number) => (
                            <div key={idx} className="py-2 flex justify-between">
                                <span>{material.name}</span>
                                <span className="font-medium">{material.quantity} {material.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Attachments */}
            {report.attachments && report.attachments.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border">
                    <h3 className="font-semibold mb-3">Attachments</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {report.attachments.map((url: string, idx: number) => (
                            <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200"
                            >
                                📎 View
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* PM Feedback */}
            {report.reviewStatus === 'REVIEWED' && report.pmFeedback && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <MessageSquare size={20} />
                        PM Feedback
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200">
                        {report.pmFeedback}
                    </p>
                </div>
            )}

            {/* Metadata */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm text-slate-500">
                <div className="flex justify-between">
                    <span>Submitted At</span>
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                </div>
                {report.reviewedAt && (
                    <div className="flex justify-between mt-2">
                        <span>Reviewed At</span>
                        <span>{new Date(report.reviewedAt).toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
