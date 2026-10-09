"use client"

import { DenseTable, field, Panel, StatusPill, useApiSources } from './RedesignKit'

export default function ProjectLinkedRecords({ projectId, kind }: { projectId: string; kind: 'team' | 'reports' | 'bids' | 'tasks' }) {
    const endpoint = kind === 'team' ? `/projects/${projectId}/members` : kind === 'reports' ? `/reports/project/${projectId}` : kind === 'tasks' ? `/tasks?projectId=${projectId}` : `/projects/${projectId}/bids`
    const { sources } = useApiSources([endpoint])
    const records = sources[0]
    const columns = kind === 'team' ? [
        { label: 'Member', keys: ['name', 'fullName'] }, { label: 'Organization', keys: ['organizationName', 'company'] }, { label: 'Role', keys: ['role'] }, { label: 'Scope', keys: ['accessScope', 'projectRole'] }, { label: 'Status', keys: ['status'], render: (record: any) => <StatusPill value={field(record, ['status'])} /> },
    ] : kind === 'reports' ? [
        { label: 'Report', keys: ['reportNo', 'title', 'id'] }, { label: 'Date', keys: ['reportDate', 'createdAt'] }, { label: 'Submitted by', keys: ['submittedByName', 'authorName'] }, { label: 'Status', keys: ['status'], render: (record: any) => <StatusPill value={field(record, ['status'])} /> },
    ] : kind === 'tasks' ? [
        { label: 'Task', keys: ['title', 'name'] }, { label: 'Assigned to', keys: ['assignedToName', 'ownerName'] }, { label: 'Due Date', keys: ['dueDate'] }, { label: 'Progress', keys: ['progress'] }, { label: 'Status', keys: ['status'], render: (record: any) => <StatusPill value={field(record, ['status'])} /> },
    ] : [
        { label: 'Bidder', keys: ['bidderName', 'vendorName'] }, { label: 'Amount', keys: ['proposedAmount'] }, { label: 'Duration', keys: ['timeline.durationDays'] }, { label: 'Submitted', keys: ['submittedAt'] }, { label: 'Status', keys: ['status'], render: (record: any) => <StatusPill value={field(record, ['status'])} /> },
    ]
    return <Panel title={kind === 'team' ? 'Project Team' : kind === 'reports' ? 'Project Reports' : kind === 'tasks' ? 'Assigned Tasks' : 'Project Bids'}><DenseTable records={records} columns={columns} /></Panel>
}
