"use client"

import { useState } from 'react'
import { Banknote, MapPinned, Plus, Route, TrendingUp } from 'lucide-react'
import {
    DenseTable, field, formatDate, formatMoney, Inspector, KeyValueList, MetricGrid, Panel, PrimaryButton,
    ProgressMeter, RefreshButton, SearchBar, SectionSkeleton, ServiceNotice, StatusPill, TabStrip, useApiSources,
    useFilteredRecords, WorkspaceHeader, type BusinessRecord,
} from './RedesignKit'

export default function SectionsWorkspace({ projectId }: { projectId: string }) {
    const { sources, loading, failed, refresh } = useApiSources([`/projects/${projectId}`, `/projects/${projectId}/sections`, `/projects/${projectId}/work-packages`])
    const [projectRows, sections, packages] = sources
    const [selected, setSelected] = useState<BusinessRecord | null>(null)
    const [query, setQuery] = useState('')
    const [tab, setTab] = useState('Sections')
    const project = projectRows[0]
    const records = useFilteredRecords(tab === 'Sections' ? sections : packages, query)
    const detail = selected || records[0]
    const length = sections.reduce((sum, item) => sum + Number(field(item, ['length', 'lengthKm'], 0)), 0)
    const planned = sections.reduce((sum, item) => sum + Number(field(item, ['plannedValue', 'budget'], 0)), 0)
    const actual = sections.reduce((sum, item) => sum + Number(field(item, ['actualValue', 'spent'], 0)), 0)
    if (loading) return <SectionSkeleton />
    return <div className="space-y-4">
        <WorkspaceHeader eyebrow="Project execution" title="Sections & Work Packages" subtitle="Define chainage-based sections, assign contractors and track execution." actions={<><RefreshButton loading={loading} onClick={refresh} /><PrimaryButton><Plus size={16} /> Add {tab === 'Sections' ? 'section' : 'package'}</PrimaryButton></>} />
        <ServiceNotice failed={failed} />
        <MetricGrid items={[
            { label: 'Total Corridor Length', value: `${length} km`, detail: field(project, ['chainageRange'], 'Approved project corridor'), icon: Route, tone: 'blue' },
            { label: 'Total Sections', value: sections.length, detail: `${sections.filter(item => /IN_PROGRESS|ACTIVE/.test(String(item.status))).length} in progress`, icon: MapPinned, tone: 'violet' },
            { label: 'Total Planned Value', value: formatMoney(planned), detail: `${formatMoney(actual)} actual`, icon: Banknote, tone: 'green' },
            { label: 'Overall Progress', value: `${field(project, ['progress'], 0)}%`, detail: `${actual}/${planned}`, icon: TrendingUp, tone: 'blue', progress: Number(field(project, ['progress'], 0)) },
        ]} />
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <Panel title={String(field(project, ['name'], 'Project execution structure'))} action={<SearchBar value={query} onChange={setQuery} placeholder="Search ID, contractor or chainage…" />}>
                <TabStrip tabs={['Sections', 'Work Packages']} active={tab} onChange={value => { setTab(value); setSelected(null) }} />
                <DenseTable records={records} onSelect={setSelected} selectedId={field(detail, ['id', '_id'])} columns={[
                    { label: 'ID', keys: ['sectionCode', 'packageCode', 'code'] }, { label: 'Chainage', keys: ['chainageRange', 'chainage'] }, { label: 'Length', keys: ['length', 'lengthKm'] },
                    { label: 'Work Scope', keys: ['workScope', 'name'] }, { label: 'Contractor', keys: ['contractorName'] }, { label: 'Subcontractor', keys: ['subcontractorName'] },
                    { label: 'Planned', keys: ['plannedValue', 'budget'], render: record => formatMoney(field(record, ['plannedValue', 'budget'], 0)) },
                    { label: 'Actual', keys: ['actualValue', 'spent'], render: record => formatMoney(field(record, ['actualValue', 'spent'], 0)) },
                    { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                ]} />
            </Panel>
            <Inspector title={String(field(detail, ['sectionCode', 'packageCode', 'code'], 'Select a record'))} status={field(detail, ['status'], undefined)}>
                <div className="border-b border-slate-200 p-4"><p className="mb-2 text-xs font-semibold text-slate-700">Corridor map</p><div className="relative h-12"><div className="absolute left-2 right-2 top-5 h-1 rounded bg-slate-200" /><div className="absolute left-2 top-5 h-1 w-1/3 rounded bg-blue-600" /><span className="absolute left-1 top-2 h-3 w-3 rounded-full bg-blue-600" /><span className="absolute left-1/3 top-2 h-3 w-3 rounded-full border-2 border-blue-600 bg-white" /></div></div>
                <KeyValueList rows={[
                    ['Work scope', field(detail, ['workScope', 'name'])], ['Chainage range', field(detail, ['chainageRange', 'chainage'])], ['Predecessor', field(detail, ['predecessorCode'])],
                    ['Successor', field(detail, ['successorCode'])], ['Planned value', formatMoney(field(detail, ['plannedValue', 'budget'], 0))], ['Actual value', formatMoney(field(detail, ['actualValue', 'spent'], 0))],
                    ['Owner', field(detail, ['ownerName'])], ['Planned start', formatDate(field(detail, ['plannedStart', 'startDate']))], ['Planned end', formatDate(field(detail, ['plannedEnd', 'endDate']))],
                ]} />
                <div className="border-t border-slate-200 p-4"><p className="mb-2 text-xs font-semibold">Progress</p><ProgressMeter value={Number(field(detail, ['progress'], 0))} /></div>
            </Inspector>
        </div>
    </div>
}
