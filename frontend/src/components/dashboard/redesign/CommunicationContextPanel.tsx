"use client"

import { DenseTable, field, Panel, StatusPill, useApiSources } from './RedesignKit'

export default function CommunicationContextPanel({ projectId }: { projectId: string }) {
    const { sources } = useApiSources([`/issues?projectId=${projectId}`, `/projects/${projectId}/documents`, `/tasks?projectId=${projectId}`])
    const [issues, documents, tasks] = sources
    return <aside className="hidden w-[360px] shrink-0 space-y-3 overflow-y-auto 2xl:block">
        <Panel title={`Pinned & Unresolved (${issues.length})`}><DenseTable records={issues.slice(0, 4)} columns={[
            { label: 'Issue', keys: ['title', 'description'] }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
        ]} /></Panel>
        <Panel title={`Document Revisions (${documents.length})`}><DenseTable records={documents.slice(0, 5)} columns={[
            { label: 'Rev', keys: ['revision'] }, { label: 'Title', keys: ['title', 'name'] }, { label: 'Date', keys: ['updatedAt', 'createdAt'] },
        ]} /></Panel>
        <Panel title={`Linked Tasks & Issues (${tasks.length})`}><DenseTable records={tasks.slice(0, 5)} columns={[
            { label: 'ID', keys: ['taskNo', 'code', 'id'] }, { label: 'Title', keys: ['title', 'name'] }, { label: 'Owner', keys: ['ownerName', 'assignedToName'] },
            { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
        ]} /></Panel>
    </aside>
}
