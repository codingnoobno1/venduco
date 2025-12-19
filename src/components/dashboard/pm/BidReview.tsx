// Bid Review Component - For PMs to review bids
"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Calendar, Users, CheckCircle2, XCircle, Clock, Phone, Mail } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

interface BidReviewProps {
    bid: any
    onApprove: (bidId: string) => void
    onReject: (bidId: string, reason: string) => void
}

export function BidReview({ bid, onApprove, onReject }: BidReviewProps) {
    const [rejecting, setRejecting] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [processing, setProcessing] = useState(false)

    async function handleApprove() {
        setProcessing(true)
        await onApprove(bid._id)
        setProcessing(false)
    }

    async function handleReject() {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection')
            return
        }
        setProcessing(true)
        await onReject(bid._id, rejectReason)
        setProcessing(false)
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                        {bid.projectName || 'Project'}
                    </h3>
                    <p className="text-sm text-slate-500">
                        Bid from: {bid.bidderName || 'Bidder'}
                    </p>
                </div>
                <StatusBadge status={bid.status} size="md" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Amount & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                            <DollarSign size={16} />
                            Proposed Amount
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            ₹{bid.proposedAmount?.toLocaleString() || 0}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                            <Calendar size={16} />
                            Duration
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {bid.timeline?.durationDays || 0} days
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                            <Users size={16} />
                            Manpower
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {bid.manpowerOffered || 0} workers
                        </p>
                    </div>
                </div>

                {/* Contact Info (masked or visible) */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            <span>{bid.contactVisible ? bid.bidderEmail : '***@***.com'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            <span>{bid.contactVisible ? bid.bidderPhone : '**********'}</span>
                        </div>
                    </div>
                    {!bid.contactVisible && bid.status !== 'APPROVED' && (
                        <p className="text-xs text-orange-600 mt-2">
                            Contact info will be visible after approval
                        </p>
                    )}
                </div>

                {/* Proposal */}
                {bid.proposal && (
                    <div>
                        <h4 className="font-medium mb-2">Proposal</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                            {bid.proposal}
                        </p>
                    </div>
                )}

                {/* Experience */}
                {bid.relevantExperience && (
                    <div>
                        <h4 className="font-medium mb-2">Relevant Experience</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {bid.relevantExperience}
                        </p>
                    </div>
                )}

                {/* Submitted At */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={14} />
                    Submitted: {new Date(bid.submittedAt).toLocaleString()}
                </div>
            </div>

            {/* Actions */}
            {bid.status === 'SUBMITTED' && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    {rejecting ? (
                        <div className="space-y-3">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejection..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setRejecting(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    {processing ? 'Rejecting...' : 'Confirm Reject'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRejecting(true)}
                                className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} />
                                Reject
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleApprove}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                    <CheckCircle2 size={18} />
                                )}
                                Approve
                            </motion.button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
