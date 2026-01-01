"use client"

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, FileText, Calendar, DollarSign, Clock } from 'lucide-react'

export default function BidReviewPage({ params }: { params: Promise<{ bidId: string }> }) {
    const router = useRouter()
    const { bidId } = use(params)
    const [bid, setBid] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchBid()
    }, [bidId])

    async function fetchBid() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/bids/${bidId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setBid(data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleAction(action: 'APPROVE' | 'REJECT') {
        setProcessing(true)
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/bids/${bidId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    reviewNotes: action === 'APPROVE' ? 'Bid approved by PM' : undefined,
                    rejectionReason: action === 'REJECT' ? 'Does not meet project requirements' : undefined
                })
            })

            if (res.ok) {
                router.push(`/dashboard/pm/projects/${bid.projectId}`)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setProcessing(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading bid...</div>
    if (!bid) return <div className="p-8 text-center">Bid not found</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Review Bid</h1>
                    <p className="text-slate-500">{bid.projectName}</p>
                </div>
            </div>

            {/* Bid Status Badge */}
            <div className={`inline-block px-4 py-2 rounded-xl font-bold ${bid.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                bid.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                }`}>
                {bid.status}
            </div>

            {/* Bidder Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4">Bidder Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Bidder Name</p>
                        <p className="text-lg font-bold mt-1">{bid.bidderName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Bidder Type</p>
                        <p className="text-lg font-bold mt-1">{bid.bidderType}</p>
                    </div>
                </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-green-600" />
                    Financial Proposal
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Proposed Amount</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">₹{bid.proposedAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Duration</p>
                        <p className="text-2xl font-bold mt-1">{bid.timeline?.durationDays || 0} days</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Payment Terms</p>
                        <p className="text-lg font-bold mt-1">{bid.paymentTerms || 'Standard'}</p>
                    </div>
                </div>
            </div>

            {/* Timeline Details */}
            {bid.timeline && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-blue-600" />
                        Timeline
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Start Date</p>
                            <p className="text-lg font-bold mt-1">
                                {new Date(bid.timeline.proposedStartDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Completion Date</p>
                            <p className="text-lg font-bold mt-1">
                                {new Date(bid.timeline.proposedCompletionDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Technical Proposal */}
            {bid.technicalProposal && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-purple-600" />
                        Technical Proposal
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{bid.technicalProposal}</p>
                </div>
            )}

            {/* Action Buttons */}
            {bid.status === 'SUBMITTED' && (
                <div className="flex gap-4 sticky bottom-6">
                    <button
                        onClick={() => handleAction('REJECT')}
                        disabled={processing}
                        className="flex-1 py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <XCircle size={20} />
                        Reject Bid
                    </button>
                    <button
                        onClick={() => handleAction('APPROVE')}
                        disabled={processing}
                        className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle size={20} />
                        {processing ? 'Processing...' : 'Approve Bid'}
                    </button>
                </div>
            )}
        </div>
    )
}
