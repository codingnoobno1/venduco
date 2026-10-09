"use client"

import { useState } from 'react'
import { AlertTriangle, ClipboardCheck, FileQuestion, MessageSquareText, Scale } from 'lucide-react'
import {
    DenseTable, field, formatDate, Inspector, KeyValueList, MetricGrid, Panel, PrimaryButton,
    RefreshButton, SearchBar, SectionSkeleton, ServiceNotice, StatusPill, useApiSources, useFilteredRecords,
    WorkspaceHeader, type BusinessRecord,
} from './RedesignKit'

export default function ConsultantWorkspace() {
    const { sources, loading, failed, refresh } = useApiSources(['/inspections/assigned', '/issues?type=NCR', '/rfis/assigned', '/measurements/assigned'])
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState<BusinessRecord | null>(null)
    const [tab, setTab] = useState('All')
    const [inspections, ncrs, rfis, measurements] = sources
    const filtered = useFilteredRecords(inspections, query).filter(record => tab === 'All' || String(field(record, ['status'])).toUpperCase().includes(tab.toUpperCase()))
    const detail = selected || inspections[0]

    if (loading) return <SectionSkeleton />
    return (
        <div className="space-y-4">
            <WorkspaceHeader eyebrow="Consultant workspace" title="Consultant Dashboard" subtitle="Technical review desk across your assigned projects." actions={<RefreshButton loading={loading} onClick={refresh} />} />
            <ServiceNotice failed={failed} />
            <MetricGrid items={[
                { label: 'Inspections due', value: inspections.length, detail: 'Assigned technical checks', icon: ClipboardCheck, tone: 'blue' },
                { label: 'Open NCRs', value: ncrs.filter(item => !/CLOSED|RESOLVED/.test(String(item.status))).length, detail: `${ncrs.length} tracked`, icon: AlertTriangle, tone: 'red' },
                { label: 'RFIs awaiting response', value: rfis.filter(item => !/CLOSED|ANSWERED/.test(String(item.status))).length, detail: `${rfis.length} assigned`, icon: MessageSquareText, tone: 'amber' },
                { label: 'Measurement reviews', value: measurements.length, detail: 'Within your review scope', icon: Scale, tone: 'violet' },
            ]} />
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_440px]">
                <Panel title="Inspection & Technical Review Queue" subtitle="Assigned to you" action={<SearchBar value={query} onChange={setQuery} placeholder="Search package, chainage or ID…" />}>
                    <div className="flex gap-2 border-b border-slate-200 px-4 py-3">{['All', 'Pending', 'Overdue', 'Completed'].map(item => <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{item}</button>)}</div>
                    <DenseTable records={filtered} onSelect={setSelected} selectedId={field(detail, ['id', '_id'])} columns={[
                        { label: 'ID', keys: ['inspectionNo', 'code', 'id'] },
                        { label: 'Package / Location', keys: ['packageName', 'projectName', 'location'] },
                        { label: 'Chainage / Area', keys: ['chainage', 'area'] },
                        { label: 'Type', keys: ['inspectionType', 'type'] },
                        { label: 'Submitted', keys: ['submittedAt', 'createdAt'], render: record => formatDate(field(record, ['submittedAt', 'createdAt'])) },
                        { label: 'Due Date', keys: ['dueDate'], render: record => formatDate(field(record, ['dueDate'])) },
                        { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                    ]} />
                </Panel>
                <Inspector title={String(field(detail, ['inspectionNo', 'code', 'title'], 'Select an inspection'))} status={field(detail, ['status'], undefined)}>
                    <div className="border-b border-slate-200 p-4"><KeyValueList rows={[
                        ['Package', field(detail, ['packageName', 'workPackage'])],
                        ['Location', field(detail, ['chainage', 'location'])],
                        ['Inspection type', field(detail, ['inspectionType', 'type'])],
                        ['Reviewer', field(detail, ['reviewerName', 'reviewer.fullName'])],
                    ]} /></div>
                    <Panel title={`Open NCRs in this package (${ncrs.length})`} className="m-3 shadow-none"><DenseTable records={ncrs.slice(0, 4)} columns={[
                        { label: 'NCR', keys: ['ncrNo', 'code', 'id'] }, { label: 'Issue', keys: ['title', 'description'] },
                        { label: 'Severity', keys: ['severity'], render: record => <StatusPill value={field(record, ['severity'])} /> },
                        { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                    ]} /></Panel>
                    <Panel title={`Overdue RFIs (${rfis.length})`} className="m-3 shadow-none"><DenseTable records={rfis.slice(0, 3)} columns={[
                        { label: 'RFI', keys: ['rfiNo', 'code', 'id'] }, { label: 'Subject', keys: ['subject', 'title'] }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                    ]} /></Panel>
                    <div className="grid grid-cols-3 gap-2 p-3"><PrimaryButton disabled={!detail}>Primary review</PrimaryButton><PrimaryButton disabled={!detail}>Clarification</PrimaryButton><PrimaryButton disabled={!detail}>Recommendation</PrimaryButton></div>
                </Inspector>
            </div>
        </div>
    )
}
