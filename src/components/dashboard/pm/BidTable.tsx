"use client"

import { DataTable } from '@/components/dashboard/shared/DataTable'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

interface BidTableProps {
    bids: any[]
    onApprove?: (bidId: string) => void
    onReject?: (bidId: string, reason: string) => void
    onView?: (bid: any) => void
}

export function BidTable({ bids, onApprove, onReject, onView }: BidTableProps) {
    const columns = [
        { key: 'bidderName', label: 'Bidder', sortable: true },
        { key: 'proposedAmount', label: 'Amount', sortable: true, render: (val: any) => `₹${val?.toLocaleString() || 0}` },
        { key: 'timeline', label: 'Duration', render: (val: any) => `${val?.durationDays || '-'} days` },
        { key: 'status', label: 'Status', render: (val: any, row: any) => <StatusBadge status={val} /> },
        {
            key: 'actions', label: '', render: (_: any, row: any) => (
                <div className="flex gap-2">
                    <button onClick={() => onView?.(row)} className="px-3 py-1 text-sm border rounded-lg">View</button>
                    {row.status === 'SUBMITTED' && onApprove && (
                        <button onClick={() => onApprove(row._id)} className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg">Approve</button>
                    )}
                </div>
            )
        }
    ]

    return (
        <DataTable
            columns={columns}
            data={bids}
            pageSize={10}
            searchable={true}
            searchKeys={[ 'bidderName', 'companyName', 'proposal' ]}
            emptyMessage="No bids found"
            onRowClick={(row) => onView?.(row)}
        />
    )
}
